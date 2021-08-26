const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const  PLAYER_STORAGE_KEY ='DQS-LAYER'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const preBtn = $('.btn-prev')
const ramdomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist =$('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRamdom: false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    

    songs: [
        {
            name: "Muộn rồi mà sao còn",
            singer: "Sơn Tùng",
            path: "./acess/mp3/son.mp3",
            image:"./acess/img/son.jpg"
        },
        {
            name: "Bộ tộc 2",
            singer: "Độ Mixi",
            path: "./acess/mp3/Domixi.mp3",  
            image:"./acess/img/den.jpg"
        },
        {
            name: "Miền gian khổ",
            singer: "Phan Mạnh Quỳnh",
            path: "acess/mp3/quynh.mp3",
            image:"./acess/img/quynh.jpg"
        },
        {
            name: "SummerTime",
            singer: "K139",
            path: "./acess/mp3/1.mp3",
            image:"./acess/img/1.jpg"
        },
        {
            name: "See You Again",
            singer: "Wiz Khalifa ",
            path: "./acess/mp3/2.mp3",
            image:"./acess/img/2.jpg"
        },
        {
            name: "Nevada",
            singer: "Shadow Music",
            path: "./acess/mp3/3.mp3",
            image:"./acess/img/3.jpg"
        },
        {
            name: "Let Me Down Slowly",
            singer: "Alec Benjamin",
            path: "./acess/mp3/4.mp3",
            image:"./acess/img/4.jpg"
        },
        {
            name: "Yêu nhan nửa ngày",
            singer: "Phan Mạnh Quỳnh",
            path: "./acess/mp3/5.mp3",
            image:"./acess/img/5.jpg"
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active': ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
            `
        });
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    handleEvents: function() {
        const _this= this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay và dừng    
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,// 10s
            iterations: Infinity,// quay vo hạn
        })
        cdThumbAnimate.pause()
        // Xử lý phóng to/ thu nhỏ
        document.onscroll = function() {
            const scrolly = window.scrollY || window.pageYOffset
            const newCdWidth = cdWidth - scrolly;
    
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0
            cd.style.opacity= newCdWidth/cdWidth
        }
       // Xử lý khi click play
       playBtn.onclick = function() {
           if(_this.isPlaying) {
               audio.pause()  
           }else{
               audio.play()
           }  
       }
       //Khi song được Play
       audio.onplay = function() {
            _this.isPlaying =true
            player.classList.add('playing')
            cdThumbAnimate.play()
       }
       //khi pause Play
       audio.onpause = function() {
            _this.isPlaying =false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
       }
       // khi tiến độ bài hát thay đổi
       audio.ontimeupdate = function() {
           if(audio.duration) {
               const progressPercent = Math.floor(audio.currentTime /audio.duration*100 )
               progress.value = progressPercent;  
           } 
        }
        // Xử lý khi tua song 
        progress.onchange = function(e) {
                const seekTime = audio.duration*e.target.value/ 100
                audio.currentTime = seekTime
        }
        // Khi next song
        nextBtn.onclick =function() {
            if(_this.isRamdom) {
                _this.playramdomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi prev song
        preBtn.onclick =function() {
            if(_this.isRamdom) {
                _this.playramdomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // Khi ramdom
        ramdomBtn.onclick = function(e) {
            _this.isRamdom =! _this.isRamdom
            ramdomBtn.classList.toggle('active',  _this.isRamdom)
            _this.setConfig('isRamdom', _this.isRamdom )
        }

        // Xử lý phát lại 1 song
        repeatBtn.onclick = function(e) {
            _this.isRepeat =! _this.isRepeat 
            repeatBtn.classList.toggle('active',  _this.isRepeat)
            _this.setConfig('isRepeat', _this.isRepeat )
        }
        // Xử lý next song khi bài hát end
        audio.onended = function() {
            if(repeatBtn) {
                audio.play()
            }else{
                nextBtn.click()
            }
        },
        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNote = e.target.closest('.song:not(.active)')
            if(songNote || e.target.closest('.option')){
                // xử lý khi click vào song
               if(songNote){
                   _this.currentIndex = Number(songNote.getAttribute('data-index'))
                   _this.loadCurrentSong()
                   _this.render()
                   audio.play()
               }
               // Xử lý khi click vào song options
               if(e.target.closest('.option')) {

               }
            }
        }

        
    },
    scrollToActiveSong: function() {
       setInterval(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearst'
            })
       }, 100);
    },
    loadCurrentSong: function() {
        
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src= this.currentSong.path
        
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex <0) {
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    playramdomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random()* this.songs.length)
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() { 
        // định nghĩa các thuộc tính cho Object
        this.defineProperties()
        // lắng nghe và sử lý các sự kiện
        this.handleEvents()

        // Tải thông tin baì hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        //Render Playlist
        this.render()
      
    },

}
app.start()
