"""
Razorpay service integration.
"""

import hmac
import hashlib
from django.conf import settings

# Check if razorpay is available
RAZORPAY_AVAILABLE = False
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    razorpay = None


class RazorpayService:
    """
    Service class for Razorpay API integration.
    """
    
    def __init__(self):
        if RAZORPAY_AVAILABLE:
            self.client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        else:
            self.client = None
            print("[DEV] Razorpay not available - using mock service")
    
    def create_order(self, amount: int, currency: str = 'INR', receipt: str = None, notes: dict = None):
        """
        Create a Razorpay order.
        
        Args:
            amount: Amount in paise
            currency: Currency code (default: INR)
            receipt: Optional receipt ID
            notes: Optional notes dict
            
        Returns:
            Razorpay order object
        """
        if not RAZORPAY_AVAILABLE:
            # Mock response for development
            import uuid
            mock_order_id = f"order_dev_{uuid.uuid4().hex[:16]}"
            print(f"[DEV] Mock Razorpay order created: {mock_order_id}")
            return {
                'id': mock_order_id,
                'amount': amount,
                'currency': currency,
                'receipt': receipt,
                'status': 'created',
            }
        
        order_data = {
            'amount': amount,
            'currency': currency,
            'payment_capture': 1,  # Auto capture payment
        }
        
        if receipt:
            order_data['receipt'] = receipt
        
        if notes:
            order_data['notes'] = notes
        
        try:
            order = self.client.order.create(data=order_data)
            return order
        except Exception as e:
            raise Exception(f"Failed to create Razorpay order: {str(e)}")
    
    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Verify Razorpay payment signature.
        
        Args:
            razorpay_order_id: Razorpay order ID
            razorpay_payment_id: Razorpay payment ID
            razorpay_signature: Signature from Razorpay
            
        Returns:
            True if signature is valid, False otherwise
        """
        if not RAZORPAY_AVAILABLE:
            # Mock - always return True in development
            print(f"[DEV] Mock payment signature verification: True")
            return True
        
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
    
    def fetch_payment(self, payment_id: str):
        """
        Fetch payment details from Razorpay.
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Payment details dict
        """
        if not RAZORPAY_AVAILABLE:
            # Mock response for development
            print(f"[DEV] Mock fetch payment: {payment_id}")
            return {
                'id': payment_id,
                'amount': 99900,
                'currency': 'INR',
                'status': 'captured',
                'method': 'upi',
            }
        
        try:
            return self.client.payment.fetch(payment_id)
        except Exception as e:
            raise Exception(f"Failed to fetch payment: {str(e)}")
    
    def refund_payment(self, payment_id: str, amount: int = None, notes: dict = None):
        """
        Refund a payment.
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to refund in paise (None for full refund)
            notes: Optional notes
            
        Returns:
            Refund details dict
        """
        if not RAZORPAY_AVAILABLE:
            # Mock response for development
            import uuid
            mock_refund_id = f"rfnd_dev_{uuid.uuid4().hex[:16]}"
            print(f"[DEV] Mock refund created: {mock_refund_id}")
            return {
                'id': mock_refund_id,
                'payment_id': payment_id,
                'amount': amount or 99900,
                'status': 'processed',
            }
        
        refund_data = {}
        
        if amount:
            refund_data['amount'] = amount
        
        if notes:
            refund_data['notes'] = notes
        
        try:
            return self.client.payment.refund(payment_id, refund_data)
        except Exception as e:
            raise Exception(f"Failed to refund payment: {str(e)}")
    
    def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        """
        Verify Razorpay webhook signature.
        
        Args:
            body: Raw request body
            signature: X-Razorpay-Signature header
            
        Returns:
            True if signature is valid
        """
        try:
            expected_signature = hmac.new(
                key=settings.RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
                msg=body,
                digestmod=hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
        except Exception:
            return False


# Singleton instance
razorpay_service = RazorpayService()
