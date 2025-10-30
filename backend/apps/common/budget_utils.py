"""
Budget calculation utilities.
"""
from decimal import Decimal
from django.db.models import Sum
from django.utils import timezone
from .date_utils import get_month_date_range


def calculate_budget_spending(usuario, year, month, categoria=None):
    """
    Calculate total spending for a user in a given month, optionally filtered by category.
    
    Args:
        usuario: User instance
        year (int): Year
        month (int): Month (1-12)
        categoria: Optional Category instance to filter by
        
    Returns:
        Decimal: Total spending amount
    """
    from apps.transactions.models import Expense
    
    start_date, end_date = get_month_date_range(year, month)
    
    query = Expense.objects.filter(
        usuario=usuario,
        fecha__range=[start_date, end_date]
    )
    
    if categoria:
        query = query.filter(categoria=categoria)
    
    total = query.aggregate(total=Sum('monto'))['total']
    return total or Decimal('0')


def check_budget_alert_needed(gastado_actual, limite_asignado, alerta_porcentaje):
    """
    Check if a budget alert is needed based on spending percentage.
    
    Args:
        gastado_actual (Decimal): Current spending
        limite_asignado (Decimal): Budget limit
        alerta_porcentaje (int): Alert threshold percentage (e.g., 80)
        
    Returns:
        bool: True if alert is needed
    """
    if limite_asignado <= 0:
        return False
    
    porcentaje = (gastado_actual / limite_asignado) * 100
    return porcentaje >= alerta_porcentaje
