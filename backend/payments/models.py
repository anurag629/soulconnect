"""
Payment and Subscription Models for KSHATRIYAConnect.

Models for subscription plans, payments, and transactions.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class SubscriptionPlan(models.Model):
    """
    Subscription plan model.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Plan details
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, unique=True)  # BASIC, PREMIUM, ELITE
    description = models.TextField()
    
    # Pricing (in INR paise)
    price = models.PositiveIntegerField(help_text="Price in paise (e.g., 99900 = ₹999)")
    original_price = models.PositiveIntegerField(null=True, blank=True)
    
    # Duration
    duration_days = models.PositiveIntegerField()
    
    # Features (stored as JSON)
    features = models.JSONField(default=list)
    
    # Plan status
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    
    # Ordering
    display_order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'subscription plan'
        verbose_name_plural = 'subscription plans'
        ordering = ['display_order']
    
    def __str__(self):
        return f"{self.name} - ₹{self.price / 100}"
    
    @property
    def price_display(self):
        return f"₹{self.price / 100:,.0f}"


class Subscription(models.Model):
    """
    User subscription model.
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions'
    )
    
    # Subscription dates
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Auto-renewal
    auto_renew = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'subscription'
        verbose_name_plural = 'subscriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"
    
    @property
    def is_active(self):
        return self.status == 'active' and self.end_date > timezone.now()
    
    @property
    def days_remaining(self):
        if self.end_date > timezone.now():
            return (self.end_date - timezone.now()).days
        return 0
    
    def activate(self):
        """Activate the subscription."""
        self.status = 'active'
        self.start_date = timezone.now()
        self.end_date = timezone.now() + timedelta(days=self.plan.duration_days)
        self.save()
        
        # Update user premium status
        self.user.is_premium = True
        self.user.save(update_fields=['is_premium'])
    
    def cancel(self):
        """Cancel the subscription."""
        self.status = 'cancelled'
        self.save()
    
    def check_expiry(self):
        """Check and update expiry status."""
        if self.status == 'active' and self.end_date <= timezone.now():
            self.status = 'expired'
            self.save()
            
            # Check if user has any other active subscription
            active_subs = Subscription.objects.filter(
                user=self.user,
                status='active',
                end_date__gt=timezone.now()
            ).exclude(id=self.id).exists()
            
            if not active_subs:
                self.user.is_premium = False
                self.user.save(update_fields=['is_premium'])


class Payment(models.Model):
    """
    Payment transaction model.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='payments'
    )
    
    # Amount details (in paise)
    amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default='INR')
    
    # Razorpay details
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    failure_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'payment'
        verbose_name_plural = 'payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.amount / 100} {self.currency}"
    
    @property
    def amount_display(self):
        return f"₹{self.amount / 100:,.0f}"


class Invoice(models.Model):
    """
    Invoice for completed payments.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    payment = models.OneToOneField(
        Payment,
        on_delete=models.CASCADE,
        related_name='invoice'
    )
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True)
    
    # Billing details
    billing_name = models.CharField(max_length=100)
    billing_email = models.EmailField()
    billing_address = models.TextField(blank=True)
    billing_state = models.CharField(max_length=50, blank=True)
    billing_pincode = models.CharField(max_length=10, blank=True)
    
    # Tax details
    subtotal = models.PositiveIntegerField()
    gst_amount = models.PositiveIntegerField(default=0)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    total = models.PositiveIntegerField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'invoice'
        verbose_name_plural = 'invoices'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"
    
    @staticmethod
    def generate_invoice_number():
        """Generate unique invoice number."""
        from datetime import datetime
        prefix = datetime.now().strftime('SC%Y%m')
        last_invoice = Invoice.objects.filter(
            invoice_number__startswith=prefix
        ).order_by('-invoice_number').first()
        
        if last_invoice:
            last_num = int(last_invoice.invoice_number[-4:])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:04d}"


class Coupon(models.Model):
    """
    Discount coupon model.
    """
    
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    
    # Discount details
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.PositiveIntegerField()
    max_discount = models.PositiveIntegerField(null=True, blank=True)
    min_purchase = models.PositiveIntegerField(default=0)
    
    # Usage limits
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    current_uses = models.PositiveIntegerField(default=0)
    max_uses_per_user = models.PositiveIntegerField(default=1)
    
    # Validity
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Restrictions
    applicable_plans = models.ManyToManyField(SubscriptionPlan, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'coupon'
        verbose_name_plural = 'coupons'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else ' INR'}"
    
    def is_valid(self):
        """Check if coupon is valid."""
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.max_uses is None or self.current_uses < self.max_uses)
        )
    
    def calculate_discount(self, amount):
        """Calculate discount amount."""
        if self.discount_type == 'percentage':
            discount = (amount * self.discount_value) / 100
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:
            discount = self.discount_value
        
        return min(discount, amount)


class CouponUsage(models.Model):
    """
    Track coupon usage by users.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='usages'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coupon_usages'
    )
    payment = models.ForeignKey(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        related_name='coupon_usages'
    )
    
    discount_applied = models.PositiveIntegerField()
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'coupon usage'
        verbose_name_plural = 'coupon usages'
        ordering = ['-used_at']
    
    def __str__(self):
        return f"{self.user.email} used {self.coupon.code}"
