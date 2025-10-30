"""
Common model mixins for the finance system.
"""
from decimal import Decimal


class ProgressMixin:
    """
    Mixin for models that track progress towards a target amount.
    
    Requires the model to have:
    - current_amount: The current amount/progress
    - target_amount: The target amount/goal
    """
    
    def get_progress_percentage(self, current_amount, target_amount):
        """
        Calculate the percentage of progress towards target.
        
        Args:
            current_amount: Current amount or count
            target_amount: Target amount or count
            
        Returns:
            float: Percentage value (0-100)
        """
        if target_amount > 0:
            return min(float((Decimal(str(current_amount)) / Decimal(str(target_amount))) * 100), 100)
        return 0
    
    def get_remaining_amount(self, current_amount, target_amount):
        """
        Calculate the remaining amount to reach target.
        
        Args:
            current_amount: Current amount or count
            target_amount: Target amount or count
            
        Returns:
            Decimal: Remaining amount (always >= 0)
        """
        return max(Decimal(str(target_amount)) - Decimal(str(current_amount)), Decimal('0'))
