document.querySelector('.hamburger').onclick = function() {
  document.querySelector('nav').classList.toggle('active');
};
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// 一鍵平滑回頂部
document.getElementById('backToTopBtn').addEventListener('click', function(e) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

