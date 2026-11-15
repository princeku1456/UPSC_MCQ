export class QuizTimer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.interval = null;
    this.secondsRemaining = 0;
    this.isPaused = false;
  }

  start(durationSeconds, startFrom = null) {
    this.stop();
    this.secondsRemaining = startFrom !== null ? startFrom : durationSeconds;
    this.isPaused = false;
    if (this.onTick) this.onTick(this.secondsRemaining);

    this.interval = setInterval(() => {
      if (!this.isPaused) {
        this.secondsRemaining--;
        if (this.onTick) this.onTick(this.secondsRemaining);

        if (this.secondsRemaining <= 0) {
          this.stop();
          if (this.onComplete) this.onComplete();
        }
      }
    }, 1000);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

export default QuizTimer;
