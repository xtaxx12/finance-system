import sqlite3

# Conectar a la base de datos
conn = sqlite3.connect('backend/db.sqlite3')
cursor = conn.cursor()

# Ver todas las tablas
print("📋 Tablas en la base de datos:")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%loan%';")
tables = cursor.fetchall()
for table in tables:
    print(f"  - {table[0]}")

# Ver préstamos
print("\n💰 PRÉSTAMOS:")
cursor.execute("""
    SELECT id, user_id, name, amount, installments, date 
    FROM loans_loan 
    ORDER BY id
""")
loans = cursor.fetchall()

for loan in loans:
    loan_id, user_id, name, amount, installments, date = loan
    print(f"\n  📋 ID: {loan_id} | Usuario: {user_id}")
    print(f"     Nombre: {name}")
    print(f"     Monto: ${amount}")
    print(f"     Cuotas: {installments}")
    print(f"     Fecha: {date}")
    
    # Ver pagos de este préstamo
    cursor.execute("""
        SELECT id, amount, date 
        FROM loans_loanpayment 
        WHERE loan_id = ?
        ORDER BY date
    """, (loan_id,))
    payments = cursor.fetchall()
    
    total_paid = sum(p[1] for p in payments)
    remaining = amount - total_paid
    
    print(f"     Pagos realizados: {len(payments)}")
    print(f"     Total pagado: ${total_paid}")
    print(f"     Restante: ${remaining}")
    
    if payments:
        print(f"     Historial de pagos:")
        for payment in payments:
            print(f"       - {payment[2]}: ${payment[1]}")

# Resumen por usuario
print("\n\n📊 RESUMEN POR USUARIO:")
cursor.execute("""
    SELECT 
        l.user_id,
        COUNT(l.id) as num_loans,
        SUM(l.amount) as total_debt,
        COALESCE(SUM(p.total_paid), 0) as total_paid
    FROM loans_loan l
    LEFT JOIN (
        SELECT loan_id, SUM(amount) as total_paid
        FROM loans_loanpayment
        GROUP BY loan_id
    ) p ON l.id = p.loan_id
    GROUP BY l.user_id
""")

summaries = cursor.fetchall()
for summary in summaries:
    user_id, num_loans, total_debt, total_paid = summary
    remaining = total_debt - total_paid
    print(f"\n  👤 Usuario ID: {user_id}")
    print(f"     Número de préstamos: {num_loans}")
    print(f"     Deuda total: ${total_debt}")
    print(f"     Total pagado: ${total_paid}")
    print(f"     Deuda restante: ${remaining}")

conn.close()
