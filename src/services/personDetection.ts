import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export class PersonDetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private video: HTMLVideoElement | null = null;
  private detectionInterval: number | null = null;
  private onPersonChange: ((present: boolean) => void) | null = null;
  private lastPersonPresent: boolean = false;

  async loadModel() {
    if (!this.model) {
      this.model = await cocoSsd.load();
    }
  }

  async startDetection(
    videoElement: HTMLVideoElement,
    onPersonChange: (present: boolean) => void
  ) {
    this.video = videoElement;
    this.onPersonChange = onPersonChange;
    await this.loadModel();
    await this.startWebcam();
    this.startDetectionLoop();
  }

  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    if (this.video && this.video.srcObject) {
      (this.video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.lastPersonPresent = false;
  }

  private async startWebcam() {
    if (!this.video) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;
    await this.video.play();
  }

  private startDetectionLoop() {
    if (!this.model || !this.video) return;
    this.detectionInterval = window.setInterval(async () => {
      if (!this.video || this.video.readyState !== 4) return;
      const predictions = await this.model!.detect(this.video);
      const personPresent = predictions.some(pred => pred.class === 'person' && pred.score && pred.score > 0.5);
      if (personPresent !== this.lastPersonPresent) {
        this.lastPersonPresent = personPresent;
        if (this.onPersonChange) this.onPersonChange(personPresent);
      }
    }, 1000);
  }
}

export const personDetectionService = new PersonDetectionService();
