// InputHandler: keyboard and mouse input for Gobble Dash.
// Tracks held keys and hands the game single "pressed" events each frame.
export class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.keysDown = new Set();
    this.pressedQueue = [];
    this.pointerQueue = [];
    this.pointerPosition = { x: 0, y: 0 };

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.keysDown.add(event.code);
      this.pressedQueue.push(event.code);
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keysDown.delete(event.code);
    });
    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.pointerPosition = {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height),
      };
      this.pointerQueue.push({ x: this.pointerPosition.x, y: this.pointerPosition.y });
      event.preventDefault();
    });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  isDown(code) {
    return this.keysDown.has(code);
  }

  consumePressed() {
    const pressed = this.pressedQueue;
    this.pressedQueue = [];
    return pressed;
  }

  consumePointers() {
    const pointers = this.pointerQueue;
    this.pointerQueue = [];
    return pointers;
  }
}
