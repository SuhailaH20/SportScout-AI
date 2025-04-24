//player Cards Pagination
function paginateCards(containerId, paginationId, cardsPerPage = 4) {
  const container = document.getElementById(containerId);
  const cards = Array.from(container.getElementsByClassName('scout-player-card'));
  const pagination = document.getElementById(paginationId);

  const totalCards = cards.length;
  const totalPages = Math.ceil(totalCards / cardsPerPage);

  function displayPage(pageNumber) {
    cards.forEach((card, index) => {
      card.style.display = (index >= (pageNumber - 1) * cardsPerPage && index < pageNumber * cardsPerPage) ? '' : 'none';
    });
 }

function createPaginationLinks() {
  pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = i;
        link.classList.add('page-link');
        link.addEventListener('click', function(e) {
          e.preventDefault();
          displayPage(i);
          updateActiveLink(i);
        });
      pagination.appendChild(link);
    }
}

function updateActiveLink(activePage) {
    const links = pagination.getElementsByClassName('page-link');
    Array.from(links).forEach((link, index) => {
      link.classList.toggle('active', index + 1 === activePage);
    });
  }

  displayPage(1);
  createPaginationLinks();
  updateActiveLink(1);
}

document.addEventListener("DOMContentLoaded", () => {
  paginateCards("scoutPage1", "playerCardsPagination", 9);
});
