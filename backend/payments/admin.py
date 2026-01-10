"""
Admin configuration for payments app.
"""

from django.contrib import admin
from .models import SubscriptionPlan, Subscription, Payment, Invoice, Coupon, CouponUsage


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'price_display', 'duration_days', 'is_active', 'is_popular']
    list_filter = ['is_active', 'is_popular']
    search_fields = ['name', 'code']
    ordering = ['display_order']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'plan', 'status', 'start_date', 'end_date',
        'is_active', 'days_remaining', 'auto_renew'
    ]
    list_filter = ['status', 'plan', 'auto_renew', 'created_at']
    search_fields = ['user__email', 'user__first_name']
    raw_id_fields = ['user', 'plan']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'plan', 'amount_display', 'status',
        'razorpay_order_id', 'razorpay_payment_id',
        'created_at', 'completed_at'
    ]
    list_filter = ['status', 'plan', 'created_at']
    search_fields = ['user__email', 'razorpay_order_id', 'razorpay_payment_id']
    raw_id_fields = ['user', 'subscription', 'plan']
    readonly_fields = [
        'razorpay_order_id', 'razorpay_payment_id',
        'razorpay_signature', 'created_at', 'completed_at'
    ]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number', 'billing_name', 'billing_email',
        'total', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['invoice_number', 'billing_name', 'billing_email']
    raw_id_fields = ['payment']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'discount_type', 'discount_value',
        'current_uses', 'max_uses', 'valid_until', 'is_active'
    ]
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_until']
    search_fields = ['code', 'description']
    filter_horizontal = ['applicable_plans']


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'discount_applied', 'used_at']
    list_filter = ['used_at']
    search_fields = ['coupon__code', 'user__email']
    raw_id_fields = ['coupon', 'user', 'payment']
