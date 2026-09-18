(() => {
  'use strict';
  const config = {endpoint: 'https://formsubmit.co/ajax/avtospeya@mail.ru', phone: '+7 921 955-01-85'};
  const services = ['Техосмотр','Страхование недвижимости / квартиры','ОСАГО / КАСКО','Шиномонтаж / хранение шин'];
  const stations = ['Бухарестская — Бухарестская ул., 1Б','Грузовой проезд — Грузовой проезд, 16','Парголово — Ленинградская ул., 99В'];
  const dialog = document.createElement('dialog');
  dialog.className = 'request-dialog';
  dialog.setAttribute('aria-labelledby','request-title');
  dialog.innerHTML = `<button class="request-close" type="button" aria-label="Закрыть форму">×</button><p class="request-kicker">АВТОСПЕЯ · ЗАПИСЬ НА УСЛУГУ</p><h2 id="request-title">Оставить заявку</h2><p class="request-intro">Оставьте телефон и расскажите, что нужно сделать. Мы свяжемся с вами, чтобы согласовать стоимость и время.</p><form><div class="request-fields"><label>Ваш телефон *<input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 999 123-45-67" required maxlength="24"></label><label>Как к вам обращаться<input name="name" autocomplete="given-name" maxlength="80" placeholder="Имя — необязательно"></label><label>Услуга<select name="service"></select></label><label>Станция<select name="station"></select></label><label class="request-wide">Комментарий<textarea name="comment" rows="3" maxlength="1500" placeholder="Укажите детали: вид транспорта, нужную страховку или размер шин и удобное время"></textarea></label></div><label class="request-honey" aria-hidden="true">Не заполняйте это поле<input name="website" tabindex="-1" autocomplete="off"></label><label class="request-consent"><input type="checkbox" name="consent" required><span>Согласен на обработку указанных данных для ответа на заявку. Данные передаются через сервис FormSubmit.</span></label><button class="request-send" type="submit">Отправить заявку</button><p class="request-status" role="status" aria-live="polite"></p><p class="request-note">Отправка заявки не бронирует время. Дождитесь подтверждения администратора.</p></form><a class="request-call" href="tel:+79219550185">Или позвоните: ${config.phone}</a>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const service = form.elements.service;
  const station = form.elements.station;
  const status = dialog.querySelector('.request-status');
  const send = dialog.querySelector('.request-send');
  let busy = false, previousFocus;
  services.forEach(s=>service.add(new Option(s,s)));
  function updateStations(preferred) {
    const heavy = /грузовика|автобуса|автопарка/.test(service.value);
    const tires = /Шиномонтаж|Хранение шин/.test(service.value);
    const list = tires ? [stations[0]] : heavy ? stations.slice(1) : stations;
    station.replaceChildren(new Option('Помогите выбрать','Помогите выбрать'));
    list.forEach(s=>station.add(new Option(s,s)));
    station.value = list.includes(preferred) ? preferred : 'Помогите выбрать';
  }
  updateStations();
  service.addEventListener('change',()=>updateStations(station.value));
  function close() { if (!busy) {dialog.close();previousFocus?.focus();} }
  dialog.querySelector('.request-close').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  document.addEventListener('click', e => {
    const button = e.target.closest?.('button');
    if (!button || dialog.contains(button)) return;
    const label = button.textContent.trim();
    const booking = button.matches('.station-book,.insurance-request,.mobile-book') || /^(Записаться|Оставить заявку|Запись в MAX|Получить карту|Запросить стоимость|Узнать стоимость|Обсудить техосмотр|Обсудить парк|Обсудить обслуживание парка|Выбрать услугу и время)/.test(label);
    if (!booking) return;
    e.preventDefault();e.stopImmediatePropagation();previousFocus=button;
    let selected = 'Техосмотр';
    if(button.closest('#insurance')) {
      const title = button.closest('article')?.querySelector('h3')?.textContent;
      selected = /ОСАГО|КАСКО/.test(title||'') ? 'ОСАГО / КАСКО' : 'Страхование недвижимости / квартиры';
      if(title && !form.elements.comment.value)form.elements.comment.value='Интересует: '+title+'.';
    }
    if(button.closest('#tires')) selected='Шиномонтаж / хранение шин';
    if(button.closest('#business')) selected='Техосмотр';
    service.value=services.includes(selected)?selected:services[0];
    const location=button.closest('.station-card')?.querySelector('h3')?.textContent || '';
    updateStations(stations.find(s=>location&&s.startsWith(location)));
    status.textContent='';
    if(/Получить карту/.test(label)&&!form.elements.comment.value)form.elements.comment.value='Хочу скидку 30% на техосмотр. Подскажите условия получения карты.';
    dialog.showModal();form.elements.phone.focus();
  },true);
  form.elements.phone.addEventListener('input',()=>form.elements.phone.setCustomValidity(''));
  form.addEventListener('submit', async e => {
    e.preventDefault(); if(busy)return;
    const phone = form.elements.phone.value.trim();
    if(phone.replace(/\D/g,'').length<10 || phone.replace(/\D/g,'').length>15){form.elements.phone.setCustomValidity('Введите телефон с кодом города или страны.');form.elements.phone.reportValidity();return;}
    if(!form.reportValidity())return;
    if(form.elements.website.value)return;
    if(!config.endpoint){status.textContent='Отправка ещё не подключена. Пожалуйста, позвоните по номеру ниже.';return;}
    busy=true;send.disabled=true;send.textContent='Отправляем…';status.textContent='';
    const data={Телефон:phone,Имя:form.elements.name.value.trim()||'Не указано',Услуга:service.value,Станция:station.value,Комментарий:form.elements.comment.value.trim()||'Не указан',Согласие:'Согласие на обработку данных для ответа на заявку подтверждено',_subject:'Новая заявка с сайта Автоспея',_template:'table',_captcha:'false',_honey:''};
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data),signal:controller.signal});
      const result=await response.json();
      if(!response.ok || !(result.success===true || result.success==='true'))throw new Error('not-confirmed');
      status.textContent='Спасибо! Заявка отправлена. Мы свяжемся с вами по указанному телефону, чтобы подтвердить детали.';
      form.reset();updateStations();
    }catch(error){status.textContent=error.name==='AbortError'?'Не получили подтверждение отправки. Данные сохранены в форме. Позвоните нам или повторите позже — повторная отправка может создать дубликат.':'Не удалось подтвердить отправку. Данные сохранены в форме. Повторите позже или позвоните нам.';}
    finally{clearTimeout(timer);busy=false;send.disabled=false;send.textContent='Отправить заявку';}
  });
})();
