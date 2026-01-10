"""
Serializers for payments app.
"""

from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment, Invoice, Coupon


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for subscription plans."""
    
    price_display = serializers.ReadOnlyField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'code', 'description', 'price', 'price_display',
            'original_price', 'duration_days', 'features',
            'is_popular', 'display_order'
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions."""
    
    plan = SubscriptionPlanSerializer(read_only=True)
    is_active = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'start_date', 'end_date',
            'status', 'is_active', 'days_remaining',
            'auto_renew', 'created_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments."""
    
    plan = SubscriptionPlanSerializer(read_only=True)
    amount_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'plan', 'amount', 'amount_display', 'currency',
            'status', 'razorpay_order_id', 'razorpay_payment_id',
            'created_at', 'completed_at'
        ]


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating a payment order."""
    
    plan_id = serializers.UUIDField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)


class VerifyPaymentSerializer(serializers.Serializer):
    """Serializer for verifying payment."""
    
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices."""
    
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'payment', 'invoice_number',
            'billing_name', 'billing_email', 'billing_address',
            'billing_state', 'billing_pincode',
            'subtotal', 'gst_amount', 'gst_rate', 'total',
            'created_at'
        ]


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupons."""
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type',
            'discount_value', 'max_discount', 'min_purchase',
            'valid_from', 'valid_until'
        ]


class ApplyCouponSerializer(serializers.Serializer):
    """Serializer for applying coupon."""
    
    code = serializers.CharField()
    plan_id = serializers.UUIDField()
