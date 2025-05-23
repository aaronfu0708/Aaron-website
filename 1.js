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

// forum留言區功能
const forumForm = document.getElementById('forumForm');
const forumCommentsDiv = document.getElementById('forumComments');
const forumToggleBtn = document.getElementById('forumToggleBtn');
let forumIsExpanded = false;

forumToggleBtn.onclick = () => {
  forumIsExpanded = !forumIsExpanded;
  forumToggleBtn.textContent = forumIsExpanded ? '關閉' : '顯示更多留言';
  forumUpdateVisibleComments();
};

function forumLoadComments() {
  forumCommentsDiv.innerHTML = '';
  const saved = localStorage.getItem('forumComments');
  if (saved) {
    const arr = JSON.parse(saved);
    arr.reverse().forEach((c, idx) => {
      forumAddCommentToDOM(c.name, c.message, false, arr.length - 1 - idx);
    });
    forumUpdateVisibleComments();
  }
}

// ...existing code...
function forumAddCommentToDOM(name, message, save = true, index = null, timestamp = null) {
  const comment = document.createElement('div');
  comment.className = 'forum-comment';
  // 顯示時間
  let timeStr = '';
  if (timestamp) {
    const date = new Date(timestamp);
    timeStr = `<div class="forum-time">${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}</div>`;
  }
  comment.innerHTML = `
    <div class="forum-author">${name}</div>
    <div class="forum-text">${message}</div>
    ${timeStr}
    <button class="forum-delete-btn">×</button>
  `;
  forumCommentsDiv.prepend(comment);

  comment.querySelector('.forum-delete-btn').onclick = function () {
    let arr = JSON.parse(localStorage.getItem('forumComments') || '[]');
    if (index === null) index = arr.length - 1;
    arr.splice(index, 1);
    localStorage.setItem('forumComments', JSON.stringify(arr));
    forumLoadComments();
  };

  if (save) {
    let arr = JSON.parse(localStorage.getItem('forumComments') || '[]');
    const now = Date.now();
    arr.push({ name, message, timestamp: now });
    localStorage.setItem('forumComments', JSON.stringify(arr));
    forumLoadComments();
  }
}

function forumLoadComments() {
  forumCommentsDiv.innerHTML = '';
  const saved = localStorage.getItem('forumComments');
  if (saved) {
    const arr = JSON.parse(saved);
    arr.reverse().forEach((c, idx) => {
      forumAddCommentToDOM(c.name, c.message, false, arr.length - 1 - idx, c.timestamp);
    });
    forumUpdateVisibleComments();
  }
}
// ...existing code...

function forumUpdateVisibleComments() {
  const comments = document.querySelectorAll('.forum-comment');
  comments.forEach((comment, idx) => {
    if (!forumIsExpanded && idx >= 1) {
      comment.classList.add('forum-hidden');
    } else {
      comment.classList.remove('forum-hidden');
    }
  });

  forumToggleBtn.style.display = comments.length > 1 ? 'block' : 'none';
}

forumForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('forumName').value.trim();
  const message = document.getElementById('forumMessage').value.trim();

  if (!name || !message) {
    alert('請輸入姓名與留言內容');
    return;
  }

  forumAddCommentToDOM(name, message, true);
  forumForm.reset();
});

forumLoadComments();
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forumForm");
  const nameInput = document.getElementById("forumName");
  const messageInput = document.getElementById("forumMessage");
  const commentsContainer = document.getElementById("forumComments");

  // 送出留言
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const time = new Date().toLocaleString();

    if (name && message) {
      firebase.database().ref("comments").push({
        name,
        message,
        time
      });

      nameInput.value = "";
      messageInput.value = "";
    }
  });

  // 讀取並顯示留言
  firebase.database().ref("comments").on("value", (snapshot) => {
    commentsContainer.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;
    const sorted = Object.entries(data).sort((a, b) => b[1].time.localeCompare(a[1].time));

    for (let [id, comment] of sorted) {
      const div = document.createElement("div");
      div.className = "forum-comment";
      div.innerHTML = `
        <div class="forum-author">${comment.name}</div>
        <div class="forum-time">${comment.time}</div>
        <div class="forum-text">${comment.message}</div>
      `;
      commentsContainer.appendChild(div);
    }
  });
});
