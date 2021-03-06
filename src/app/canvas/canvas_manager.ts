import { Point2D } from '@app/structures/point';

export class CanvasManager {
  scale: number = 1;
  origin: Point2D = new Point2D;
  element: HTMLCanvasElement;
  drawer: CanvasRenderingContext2D;

  constructor(element: HTMLCanvasElement) {
    this.element = element;
    this.drawer = element.getContext('2d');
  }

  getNativeElement(): HTMLCanvasElement {
    return this.element
  }

  clearCanvas() {
    this.drawer.clearRect(
      (-this.origin.x - 5000),
      (-this.origin.y - 5000),
      (this.element.width * 5000),
      (this.element.height * 5000)
    );
  }

  centerOn(point: Point2D) {
    let center = new Point2D(this.element.width / 2, this.element.height / 2);
    this.setOrigin(center.x - point.x * this.scale, center.y - point.y * this.scale);
  }

  setOrigin(x: number, y: number) {
    let deltaX = x - this.origin.x,
        deltaY = y - this.origin.y;

    this.origin = new Point2D(this.origin.x + deltaX, this.origin.y + deltaY);
    this.drawer.translate(deltaX, deltaY);
  }

  shiftOrigin(deltaX: number, deltaY: number) {
    this.origin.shift(deltaX, deltaY);
    this.drawer.translate(deltaX, deltaY);
  }

  paintPoint(p: Point2D) {
    this.drawer.beginPath();
    this.drawer.fillStyle = 'white';
    this.drawer.fillRect(p.x * this.scale, p.y * this.scale, 1, 1);
    this.drawer.closePath();
  }

  paintLine(start: Point2D, end: Point2D) {
    this.drawer.beginPath();
    this.drawer.moveTo(start.x * this.scale, start.y * this.scale);
    this.drawer.lineTo(end.x * this.scale, end.y * this.scale);
    this.drawer.stroke();
    this.drawer.closePath();
  }

  paintCircle(center: Point2D, radius: number) {
    this.drawer.beginPath();
    this.drawer.arc(center.x * this.scale, center.y * this.scale, radius * this.scale, 0, 2 * Math.PI);
    this.drawer.stroke();
    this.drawer.closePath();
  }

  paintFilledCircle(center: Point2D, radius: number) {
    this.drawer.beginPath();
    this.drawer.arc(center.x * this.scale, center.y * this.scale, radius * this.scale, 0, 2 * Math.PI);
    this.drawer.fill();
    this.drawer.closePath();
  }

  setFillStyle(style: string) {
    this.drawer.fillStyle = style;
  }

  setStrokeStyle(style: string) {
    this.drawer.strokeStyle = style;
  }

  setLineWidth(width: number) {
    this.drawer.lineWidth = width;
  }

  setScale(scale: number, focalPoint?: Point2D) {
    if (focalPoint) {
      this.shiftOriginOnScaleChange(focalPoint, this.scale, scale);
    }

    this.scale = scale;
  }

  protected shiftOriginOnScaleChange(focalPoint: Point2D, originalScale: number, newScale: number) {
    let originalPoint = focalPoint.clone().shift(-this.origin.x, -this.origin.y).scale(1 / originalScale),
        newPoint = originalPoint.clone().scale(newScale).shift(this.origin.x, this.origin.y);

    this.shiftOrigin(focalPoint.x - newPoint.x, focalPoint.y - newPoint.y)
  }

}