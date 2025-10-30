"""
Tests for common utilities.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import date
from apps.common.date_utils import get_month_date_range
from apps.common.mixins import ProgressMixin
from apps.common.budget_utils import calculate_budget_spending, check_budget_alert_needed
from apps.transactions.models import Expense
from apps.categories.models import Category


class DateUtilsTest(TestCase):
    """Tests for date utility functions."""
    
    def test_get_month_date_range_regular_month(self):
        """Test date range calculation for a regular month."""
        start, end = get_month_date_range(2024, 3)
        self.assertEqual(start, date(2024, 3, 1))
        self.assertEqual(end, date(2024, 3, 31))
    
    def test_get_month_date_range_february(self):
        """Test date range calculation for February."""
        start, end = get_month_date_range(2024, 2)
        self.assertEqual(start, date(2024, 2, 1))
        self.assertEqual(end, date(2024, 2, 29))  # 2024 is a leap year
    
    def test_get_month_date_range_december(self):
        """Test date range calculation for December."""
        start, end = get_month_date_range(2024, 12)
        self.assertEqual(start, date(2024, 12, 1))
        self.assertEqual(end, date(2024, 12, 31))


class ProgressMixinTest(TestCase):
    """Tests for ProgressMixin."""
    
    def setUp(self):
        self.mixin = ProgressMixin()
    
    def test_get_progress_percentage_half(self):
        """Test progress percentage calculation at 50%."""
        percentage = self.mixin.get_progress_percentage(50, 100)
        self.assertEqual(percentage, 50.0)
    
    def test_get_progress_percentage_complete(self):
        """Test progress percentage calculation at 100%."""
        percentage = self.mixin.get_progress_percentage(100, 100)
        self.assertEqual(percentage, 100.0)
    
    def test_get_progress_percentage_over_complete(self):
        """Test progress percentage caps at 100%."""
        percentage = self.mixin.get_progress_percentage(150, 100)
        self.assertEqual(percentage, 100.0)
    
    def test_get_progress_percentage_zero_target(self):
        """Test progress percentage with zero target."""
        percentage = self.mixin.get_progress_percentage(50, 0)
        self.assertEqual(percentage, 0)
    
    def test_get_remaining_amount(self):
        """Test remaining amount calculation."""
        remaining = self.mixin.get_remaining_amount(30, 100)
        self.assertEqual(remaining, Decimal('70'))
    
    def test_get_remaining_amount_negative(self):
        """Test remaining amount doesn't go negative."""
        remaining = self.mixin.get_remaining_amount(150, 100)
        self.assertEqual(remaining, Decimal('0'))


class BudgetUtilsTest(TestCase):
    """Tests for budget utility functions."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            nombre='Test Category',
            descripcion='Test',
            color='#000000',
            icono='test'
        )
    
    def test_calculate_budget_spending_no_expenses(self):
        """Test budget spending calculation with no expenses."""
        total = calculate_budget_spending(self.user, 2024, 3)
        self.assertEqual(total, Decimal('0'))
    
    def test_calculate_budget_spending_with_expenses(self):
        """Test budget spending calculation with expenses."""
        Expense.objects.create(
            usuario=self.user,
            categoria=self.category,
            monto=Decimal('100.00'),
            fecha=date(2024, 3, 15),
            descripcion='Test expense'
        )
        Expense.objects.create(
            usuario=self.user,
            categoria=self.category,
            monto=Decimal('50.00'),
            fecha=date(2024, 3, 20),
            descripcion='Test expense 2'
        )
        
        total = calculate_budget_spending(self.user, 2024, 3)
        self.assertEqual(total, Decimal('150.00'))
    
    def test_calculate_budget_spending_by_category(self):
        """Test budget spending calculation filtered by category."""
        other_category = Category.objects.create(
            nombre='Other Category',
            descripcion='Other',
            color='#ffffff',
            icono='other'
        )
        
        Expense.objects.create(
            usuario=self.user,
            categoria=self.category,
            monto=Decimal('100.00'),
            fecha=date(2024, 3, 15),
            descripcion='Test expense'
        )
        Expense.objects.create(
            usuario=self.user,
            categoria=other_category,
            monto=Decimal('50.00'),
            fecha=date(2024, 3, 20),
            descripcion='Other expense'
        )
        
        total = calculate_budget_spending(self.user, 2024, 3, categoria=self.category)
        self.assertEqual(total, Decimal('100.00'))
    
    def test_check_budget_alert_needed_below_threshold(self):
        """Test alert not needed when below threshold."""
        needs_alert = check_budget_alert_needed(
            Decimal('50'), Decimal('100'), 80
        )
        self.assertFalse(needs_alert)
    
    def test_check_budget_alert_needed_at_threshold(self):
        """Test alert needed when at threshold."""
        needs_alert = check_budget_alert_needed(
            Decimal('80'), Decimal('100'), 80
        )
        self.assertTrue(needs_alert)
    
    def test_check_budget_alert_needed_above_threshold(self):
        """Test alert needed when above threshold."""
        needs_alert = check_budget_alert_needed(
            Decimal('90'), Decimal('100'), 80
        )
        self.assertTrue(needs_alert)
