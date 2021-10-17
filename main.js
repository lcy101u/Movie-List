const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
//+Card List切換
const displayModeSelector = document.querySelector('#display-mode-selector')
const btnCard = document.querySelector('.btn-card')
const btnList = document.querySelector('.btn-list')
let currentPage = 1
let displayMode = 'card' //預設'card'
//-Card List切換

function renderMovieList(data) {
  let rawHtml = ''
  if(displayMode === 'card') {
    data.forEach(item => {
      rawHtml += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                  data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    });
  } else if(displayMode === 'list') {
    rawHtml = '<ul class="list-group list-group-flush d-flex w-100">'
    data.forEach(item => {
      rawHtml += `
        <li class="list-group-item d-flex justify-content-between">
          <div>
            <h5>${item.title}</h5>
          </div>
          <div>
            <button class="btn btn-primary btn-show-movie" data-toggle="modal"
              data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>            
          </div>
        </li>
      `
    });
    rawHtml += '</ul>'
  }
  dataPanel.innerHTML = rawHtml
}

function showMovieModal(id){
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL+id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if(list.some(movie => movie.id === id)) {
    return alert("此電影已在清單中!!")
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列 slive() 會回傳一個新陣列，為原陣列begin to end (不含end)的copy
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  //計算要多少頁
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for(let page = 1; page <= numberOfPages; page ++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
//Card List 切換
displayModeSelector.addEventListener('click', function onDisplayModeClicked(event) {
  let target = event.target
  if(!target.matches('.fa'))  return
  if(target.dataset.mode === 'card') {
    displayMode = 'card'
    btnCard.classList.toggle('text-primary')
    btnCard.classList.toggle('text-secondary')
    btnList.classList.toggle('text-secondary')
    btnList.classList.toggle('text-primary')
    renderMovieList(getMovieByPage(currentPage))
  }else if(target.dataset.mode === 'list') {
    displayMode = 'list'
    btnList.classList.toggle('text-primary')
    btnList.classList.toggle('text-secondary')
    btnCard.classList.toggle('text-secondary')
    btnCard.classList.toggle('text-primary')
    renderMovieList(getMovieByPage(currentPage))
  }

})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if(event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event){
  event.preventDefault() //阻止Browser對該事件的預設行為
  const keyword = searchInput.value.trim().toLowerCase()//input value 去除頭尾空字串並轉成小寫
  console.log(keyword)
  //filter() : 回傳符合條件的陣列
  
  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )
  if(!filteredMovies.length) {
    alert("No movie with keyword: " + keyword)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event){
  //如果不是點<a></a> 就直接return
  if(event.target.tagName !== 'A')  return
  //取得被點的頁數via dataset
  const page = Number(event.target.dataset.page)
  currentPage = page //更新全域的currentPage，這樣在切換List/Card 的時候不用重新從第一頁開始
  renderMovieList(getMovieByPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(1))
  })
  .catch((err) => console.log(err))
  

