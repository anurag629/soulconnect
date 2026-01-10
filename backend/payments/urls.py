"""
URL configuration for payments app.
"""

from django.urls import path
from .views import (
    SubscriptionPlanListView, CreateOrderView, VerifyPaymentView,
    RazorpayWebhookView, MySubscriptionView, SubscriptionHistoryView,
    PaymentHistoryView, InvoiceListView, InvoiceDetailView,
    ValidateCouponView, CancelSubscriptionView
)

app_name = 'payments'

urlpatterns = [
    # Plans
    path('plans/', SubscriptionPlanListView.as_view(), name='plan_list'),
    
    # Orders & Payments
    path('create-order/', CreateOrderView.as_view(), name='create_order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('webhook/', RazorpayWebhookView.as_view(), name='razorpay_webhook'),
    
    # Subscriptions
    path('subscription/', MySubscriptionView.as_view(), name='my_subscription'),
    path('subscription/history/', SubscriptionHistoryView.as_view(), name='subscription_history'),
    path('subscription/cancel/', CancelSubscriptionView.as_view(), name='cancel_subscription'),
    
    # Payment History
    path('history/', PaymentHistoryView.as_view(), name='payment_history'),
    
    # Invoices
    path('invoices/', InvoiceListView.as_view(), name='invoice_list'),
    path('invoices/<uuid:id>/', InvoiceDetailView.as_view(), name='invoice_detail'),
    
    # Coupons
    path('validate-coupon/', ValidateCouponView.as_view(), name='validate_coupon'),
]
