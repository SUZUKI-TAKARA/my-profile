import './style.css';

let count = 0;

document.querySelector('#app').innerHTML = `
  <main class="counter">
    <h1>カウンターアプリ</h1>
    <p id="count">0</p>
    <div class="buttons">
      <button id="decrease">−</button>
      <button id="reset">リセット</button>
      <button id="increase">＋</button>
    </div>
  </main>
`;

const countElement = document.querySelector('#count');

function updateCount() {
  countElement.textContent = count;
}

document.querySelector('#increase').addEventListener('click', () => {
  count += 1;
  updateCount();
});

document.querySelector('#decrease').addEventListener('click', () => {
  count -= 1;
  updateCount();
});

document.querySelector('#reset').addEventListener('click', () => {
  count = 0;
  updateCount();
});
