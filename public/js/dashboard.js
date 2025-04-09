
  function openPopup(title, content) {
    document.getElementById('popupTitle').innerText = title;
    document.getElementById('popupContent').innerText = content;
    document.getElementById('popupOverlay').style.display = 'flex';
  }

  function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
  }
