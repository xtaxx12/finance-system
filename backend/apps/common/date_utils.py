"""
Common date utilities for the finance system.
"""
from datetime import datetime, timedelta


def get_month_date_range(year, month):
    """
    Calculate the start and end date for a given month.
    
    Args:
        year (int): The year
        month (int): The month (1-12)
        
    Returns:
        tuple: (start_date, end_date) for the month
    """
    start_date = datetime(year, month, 1).date()
    
    if month == 12:
        end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
    
    return start_date, end_date
