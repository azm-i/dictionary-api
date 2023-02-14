import Component from '~/parentClass/Component'
import eventBus from '~/events/eventBus'
import { onTick, offTick } from '~/events/tick'
import gsapK from '~/utils/gsapK'
import { addMouseenterListener, addMouseleaveListener } from '~/utils/mouse'
import { getOffsetPos } from '~/utils/event'
import passive from '~/utils/passive'

export default class cModalMovie extends Component {
  isPlay = false
  _isPointerdown = false

  constructor(context = document) {
    super({ el: context.querySelector('[data-movie]'), isPermanent: true })

    this.elPlay = this.el.querySelector('[data-movie-play]')
    this.elPause = this.el.querySelector('[data-movie-pause]')
    this.elSound = this.el.querySelector('[data-movie-sound]')
    this.elSoundText = this.el.querySelector('[data-movie-sound-text]')
    this.elSeekBar = this.el.querySelector('[data-movie-seek-bar]')
    this.elSeekBarProgress = this.el.querySelector(
      '[data-movie-seek-bar-progress]'
    )
    this.elTimeNow = this.el.querySelector('[data-movie-time-now]')
    this.elTimeAll = this.el.querySelector('[data-movie-time-all]')

    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player('playerMovie', {
        height: 619,
        width: 1100,
        videoId: 'jZ4B66Yav9I',
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: this._onPlayerReady.bind(this),
          onStateChange: this._onPlayerStateChange.bind(this),
        },
      })
    }

    this._isFirst = true
    this._isOpen = false
    this._callbackModalOpen = (id) => {
      if (id !== 'movie') return

      if (this._isFirst) {
        this._isFirst = false

        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }

      if (this._listener) {
        onTick(this._listener)
      } else {
        this._isOpen = true
      }
    }
    eventBus.on('startOpenModal', this._callbackModalOpen)

    this._callbackModalClose = (id) => {
      if (id !== 'movie') return

      this._pause()
      offTick(this._listener)
    }
    eventBus.on('completeCloseModal', this._callbackModalClose)

    addMouseenterListener(this.elSeekBar, () => {
      gsapK.to(this.elSeekBar, {
        scaleY: 1.5,
        duration: 0.5,
      })
    })
    addMouseleaveListener(this.elSeekBar, () => {
      gsapK.to(this.elSeekBar, {
        scaleY: 1,
        duration: 0.3,
      })
    })

    this.elSeekBar.addEventListener(
      'pointerdown',
      (e) => {
        this._isPointerdown = true
        const { x } = getOffsetPos(e)
        this._seekTo(x)
      },
      passive
    )
    this.elSeekBar.addEventListener(
      'pointermove',
      (e) => {
        if (!this._isPointerdown) return

        const { x } = getOffsetPos(e)
        this._seekTo(x)
      },
      passive
    )
    this.elSeekBar.addEventListener(
      'pointerup',
      (e) => {
        this._isPointerdown = false
      },
      passive
    )
  }

  _onPlayerReady() {
    this.elPlay.addEventListener('click', () => {
      this._play()
    })
    this.elPause.addEventListener('click', () => {
      this._pause()
    })
    this.elSound.addEventListener('click', () => {
      if (this.player.isMuted()) {
        this.player.unMute()
        this.elSound.classList.remove('-off')
        this.elSoundText.textContent = 'Sound On'
      } else {
        this.player.mute()
        this.elSound.classList.add('-off')
        this.elSoundText.textContent = 'Sound Off'
      }
    })

    const duration = (this._duration = this.player.getDuration())
    this.elTimeAll.textContent = this._timeChange(Math.floor(duration))

    let count = 0
    this._listener = () => {
      count += 1
      if (count % 6 !== 0) return

      const currentTime = this.player.getCurrentTime()

      this.elTimeNow.textContent = this._timeChange(Math.floor(currentTime))

      let scaleX = currentTime / duration
      if (scaleX > 0.99) scaleX = 1
      gsap.set(this.elSeekBarProgress, {
        scaleX,
      })
    }
    if (this._isOpen) {
      onTick(this._listener)
    }
  }

  _onPlayerStateChange({ data }) {
    switch (data) {
      case YT.PlayerState.PLAYING:
        this._play(true)
        break
      case YT.PlayerState.PAUSED:
        this._pause(true)
        break
    }
  }

  _timeChange(val) {
    let min = Math.floor(val / 60)
    let sec = val % 60

    if (min < 10) min = '0' + min
    if (sec < 10) sec = '0' + sec

    return min + ':' + sec
  }

  _play(isOnlyUi) {
    if (this.isPlay) return
    this.isPlay = true

    if (!isOnlyUi) {
      this.player.playVideo()
    }
    this.elPause.classList.add('-active')
    this.elPlay.classList.remove('-active')
  }

  _pause(isOnlyUi) {
    if (!this.isPlay) return
    this.isPlay = false

    if (!isOnlyUi) {
      this.player.pauseVideo()
    }
    this.elPlay.classList.add('-active')
    this.elPause.classList.remove('-active')
  }

  _stop() {
    this.player.stopVideo()
  }

  _seekTo(x) {
    this.player.seekTo((x / this.elSeekBar.offsetWidth) * this._duration)
  }

  onDestroy() {
    eventBus.off('startOpenModal', this._callbackModalOpen)
    eventBus.off('completeCloseModal', this._callbackModalClose)
    offTick(this._listener)
    this._stop()

    super.onDestroy()
  }
}
