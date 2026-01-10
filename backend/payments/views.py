"""
Views for payments app.
"""

import json
from django.utils import timezone
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import (
    SubscriptionPlan, Subscription, Payment, Invoice, Coupon, CouponUsage
)
from .serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer,
    CreateOrderSerializer, VerifyPaymentSerializer, InvoiceSerializer,
    CouponSerializer, ApplyCouponSerializer
)
from .razorpay_service import razorpay_service


class SubscriptionPlanListView(generics.ListAPIView):
    """
    List all active subscription plans.
    """
    permission_classes = [AllowAny]
    serializer_class = SubscriptionPlanSerializer
    queryset = SubscriptionPlan.objects.filter(is_active=True)


class CreateOrderView(views.APIView):
    """
    Create a Razorpay order for subscription purchase.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        
        if serializer.is_valid():
            plan_id = serializer.validated_data['plan_id']
            coupon_code = serializer.validated_data.get('coupon_code')
            
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response(
                    {'error': 'Plan not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            amount = plan.price
            discount = 0
            coupon = None
            
            # Apply coupon if provided
            if coupon_code:
                try:
                    coupon = Coupon.objects.get(code__iexact=coupon_code)
                    
                    if not coupon.is_valid():
                        return Response(
                            {'error': 'Coupon is not valid or has expired.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Check if applicable to plan
                    if coupon.applicable_plans.exists() and plan not in coupon.applicable_plans.all():
                        return Response(
                            {'error': 'Coupon is not applicable to this plan.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Check user usage limit
                    user_uses = CouponUsage.objects.filter(
                        coupon=coupon,
                        user=request.user
                    ).count()
                    
                    if user_uses >= coupon.max_uses_per_user:
                        return Response(
                            {'error': 'You have already used this coupon.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Calculate discount
                    discount = coupon.calculate_discount(amount)
                    amount = amount - discount
                    
                except Coupon.DoesNotExist:
                    return Response(
                        {'error': 'Invalid coupon code.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Minimum amount check
            if amount < 100:  # Minimum ₹1
                amount = 100
            
            # Create Razorpay order
            try:
                order = razorpay_service.create_order(
                    amount=amount,
                    currency='INR',
                    receipt=f"sub_{request.user.id}_{plan.code}",
                    notes={
                        'user_id': str(request.user.id),
                        'plan_id': str(plan.id),
                        'coupon_code': coupon_code or ''
                    }
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create pending subscription
            subscription = Subscription.objects.create(
                user=request.user,
                plan=plan,
                start_date=timezone.now(),
                end_date=timezone.now(),  # Will be updated on payment success
                status='pending'
            )
            
            # Create payment record
            payment = Payment.objects.create(
                user=request.user,
                subscription=subscription,
                plan=plan,
                amount=amount,
                razorpay_order_id=order['id'],
                status='pending'
            )
            
            return Response({
                'order_id': order['id'],
                'amount': amount,
                'currency': 'INR',
                'key_id': settings.RAZORPAY_KEY_ID,
                'plan': SubscriptionPlanSerializer(plan).data,
                'discount_applied': discount,
                'payment_id': str(payment.id)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(views.APIView):
    """
    Verify payment after Razorpay checkout.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        
        if serializer.is_valid():
            razorpay_order_id = serializer.validated_data['razorpay_order_id']
            razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
            razorpay_signature = serializer.validated_data['razorpay_signature']
            
            # Find payment
            try:
                payment = Payment.objects.get(
                    razorpay_order_id=razorpay_order_id,
                    user=request.user
                )
            except Payment.DoesNotExist:
                return Response(
                    {'error': 'Payment not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verify signature
            is_valid = razorpay_service.verify_payment_signature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            )
            
            if not is_valid:
                payment.status = 'failed'
                payment.failure_reason = 'Invalid payment signature'
                payment.save()
                
                return Response(
                    {'error': 'Payment verification failed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update payment
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'completed'
            payment.completed_at = timezone.now()
            payment.save()
            
            # Activate subscription
            subscription = payment.subscription
            subscription.activate()
            
            # Create invoice
            invoice = Invoice.objects.create(
                payment=payment,
                invoice_number=Invoice.generate_invoice_number(),
                billing_name=f"{request.user.first_name} {request.user.last_name}",
                billing_email=request.user.email,
                subtotal=payment.amount,
                gst_amount=int(payment.amount * 0.18),
                total=int(payment.amount * 1.18)
            )
            
            return Response({
                'message': 'Payment successful. Your subscription is now active.',
                'subscription': SubscriptionSerializer(subscription).data,
                'invoice': InvoiceSerializer(invoice).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(views.APIView):
    """
    Handle Razorpay webhook events.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature')
        
        if not signature:
            return Response(
                {'error': 'Missing signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify webhook signature
        if not razorpay_service.verify_webhook_signature(request.body, signature):
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse event
        try:
            event = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(
                {'error': 'Invalid JSON'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event_type = event.get('event')
        
        if event_type == 'payment.captured':
            # Payment was successfully captured
            payload = event.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payload.get('order_id')
            payment_id = payload.get('id')
            
            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                
                if payment.status != 'completed':
                    payment.razorpay_payment_id = payment_id
                    payment.status = 'completed'
                    payment.completed_at = timezone.now()
                    payment.save()
                    
                    # Activate subscription
                    if payment.subscription:
                        payment.subscription.activate()
                        
            except Payment.DoesNotExist:
                pass
        
        elif event_type == 'payment.failed':
            payload = event.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payload.get('order_id')
            
            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                payment.status = 'failed'
                payment.failure_reason = payload.get('error_description', 'Payment failed')
                payment.save()
            except Payment.DoesNotExist:
                pass
        
        elif event_type == 'refund.created':
            payload = event.get('payload', {}).get('refund', {}).get('entity', {})
            payment_id = payload.get('payment_id')
            
            try:
                payment = Payment.objects.get(razorpay_payment_id=payment_id)
                payment.status = 'refunded'
                payment.save()
                
                # Cancel subscription
                if payment.subscription:
                    payment.subscription.cancel()
            except Payment.DoesNotExist:
                pass
        
        return Response({'status': 'ok'})


class MySubscriptionView(generics.RetrieveAPIView):
    """
    Get current user's active subscription.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer
    
    def get_object(self):
        return Subscription.objects.filter(
            user=self.request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if not instance:
            return Response({
                'has_subscription': False,
                'subscription': None
            })
        
        return Response({
            'has_subscription': True,
            'subscription': SubscriptionSerializer(instance).data
        })


class SubscriptionHistoryView(generics.ListAPIView):
    """
    List user's subscription history.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionSerializer
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)


class PaymentHistoryView(generics.ListAPIView):
    """
    List user's payment history.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        return Payment.objects.filter(
            user=self.request.user,
            status='completed'
        )


class InvoiceListView(generics.ListAPIView):
    """
    List user's invoices.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer
    
    def get_queryset(self):
        return Invoice.objects.filter(payment__user=self.request.user)


class InvoiceDetailView(generics.RetrieveAPIView):
    """
    Get invoice details.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return Invoice.objects.filter(payment__user=self.request.user)


class ValidateCouponView(views.APIView):
    """
    Validate a coupon code.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        
        if serializer.is_valid():
            code = serializer.validated_data['code']
            plan_id = serializer.validated_data['plan_id']
            
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id)
            except SubscriptionPlan.DoesNotExist:
                return Response(
                    {'error': 'Plan not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            try:
                coupon = Coupon.objects.get(code__iexact=code)
                
                if not coupon.is_valid():
                    return Response(
                        {'valid': False, 'error': 'Coupon has expired.'},
                        status=status.HTTP_200_OK
                    )
                
                # Check if applicable to plan
                if coupon.applicable_plans.exists() and plan not in coupon.applicable_plans.all():
                    return Response(
                        {'valid': False, 'error': 'Coupon not applicable to this plan.'},
                        status=status.HTTP_200_OK
                    )
                
                # Calculate discount
                discount = coupon.calculate_discount(plan.price)
                final_price = plan.price - discount
                
                return Response({
                    'valid': True,
                    'coupon': CouponSerializer(coupon).data,
                    'discount': discount,
                    'final_price': final_price
                })
                
            except Coupon.DoesNotExist:
                return Response(
                    {'valid': False, 'error': 'Invalid coupon code.'},
                    status=status.HTTP_200_OK
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CancelSubscriptionView(views.APIView):
    """
    Cancel auto-renewal of subscription.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()
        
        if not subscription:
            return Response(
                {'error': 'No active subscription found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        subscription.auto_renew = False
        subscription.save(update_fields=['auto_renew'])
        
        return Response({
            'message': 'Auto-renewal cancelled. Your subscription will remain active until the end date.',
            'subscription': SubscriptionSerializer(subscription).data
        })
