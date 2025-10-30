// Script de depuración para verificar préstamos
// Ejecuta esto en la consola del navegador (F12)

console.log('🔍 DEPURACIÓN DE PRÉSTAMOS');
console.log('=' .repeat(80));

// 1. Verificar localStorage
const userId = JSON.parse(localStorage.getItem('user'))?.id;
console.log(`\n👤 Usuario ID: ${userId}`);

if (userId) {
  const loansKey = `loans_${userId}`;
  const loansData = localStorage.getItem(loansKey);
  
  if (loansData) {
    const loans = JSON.parse(loansData);
    console.log(`\n📋 Préstamos en localStorage (${loans.length}):`);
    
    let totalDebt = 0;
    let totalPaid = 0;
    
    loans.forEach((loan, index) => {
      const paid = loan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const remaining = loan.amount - paid;
      
      console.log(`\n  ${index + 1}. ${loan.name}`);
      console.log(`     ID: ${loan.id}`);
      console.log(`     Monto total: $${loan.amount}`);
      console.log(`     Cuotas: ${loan.installments}`);
      console.log(`     Pagos: ${loan.payments?.length || 0}`);
      console.log(`     Total pagado: $${paid}`);
      console.log(`     Restante: $${remaining}`);
      
      totalDebt += loan.amount;
      totalPaid += paid;
    });
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total deuda: $${totalDebt}`);
    console.log(`   Total pagado: $${totalPaid}`);
    console.log(`   Deuda restante: $${totalDebt - totalPaid}`);
  } else {
    console.log('\n❌ No hay préstamos en localStorage');
  }
}

// 2. Verificar API
console.log('\n\n🌐 Verificando API...');
fetch('/api/loans/summary/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('\n📊 Resumen desde API:');
    console.log(`   Total préstamos: ${data.total_loans}`);
    console.log(`   Préstamos activos: ${data.active_loans}`);
    console.log(`   Préstamos completados: ${data.completed_loans}`);
    console.log(`   Deuda total: $${data.total_debt}`);
    console.log(`   Total pagado: $${data.total_paid}`);
    console.log(`   Deuda restante: $${data.remaining_debt}`);
  })
  .catch(err => {
    console.error('❌ Error al consultar API:', err);
  });

// 3. Listar todos los préstamos desde la API
fetch('/api/loans/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
  .then(res => res.json())
  .then(data => {
    const loans = data.results || data;
    console.log(`\n\n📋 Préstamos desde API (${loans.length}):`);
    
    loans.forEach((loan, index) => {
      console.log(`\n  ${index + 1}. ${loan.name}`);
      console.log(`     ID: ${loan.id}`);
      console.log(`     Monto total: $${loan.amount}`);
      console.log(`     Cuotas: ${loan.paid_installments}/${loan.installments}`);
      console.log(`     Total pagado: $${loan.total_paid}`);
      console.log(`     Restante: $${loan.remaining_amount}`);
      console.log(`     Progreso: ${loan.progress_percentage.toFixed(1)}%`);
      console.log(`     Completado: ${loan.is_completed ? 'Sí' : 'No'}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al listar préstamos:', err);
  });

console.log('\n' + '='.repeat(80));
console.log('✅ Depuración completada');
