(() => {
const web='https://web.max.ru/330979539';
const app='max://max.ru/330979539';
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a');
 if(!link || link.href!==web || link.dataset.maxWeb==='true')return;
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
 if(!mobile)return;
 event.preventDefault();
 let panel=document.getElementById('max-app-help');
 if(!panel){
  panel=document.createElement('div');panel.id='max-app-help';panel.setAttribute('role','status');
  const text=document.createElement('p');text.textContent='Если MAX не открылся, разрешите переход в приложение или воспользуйтесь веб-версией.';
  const fallback=document.createElement('a');fallback.href=web;fallback.dataset.maxWeb='true';fallback.textContent='Открыть веб-версию';
  const close=document.createElement('button');close.type='button';close.textContent='Закрыть';close.onclick=()=>panel.remove();
  panel.append(text,fallback,close);
  // Place inside an existing modal so its focus trap and inert backdrop do not block the fallback.
  (link.closest('[role="dialog"]')||document.body).append(panel);
 }
 window.location.href=app;
},true);
})();