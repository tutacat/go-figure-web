import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { Point2D } from '@app/structures/point';
import { CanvasManager } from '@app/canvas/canvas_manager';

@Component({
  selector: 'iai-draggable-canvas',
  templateUrl: './draggable-canvas.component.html',
  styleUrls: ['./draggable-canvas.component.scss']
})
export class DraggableCanvasComponent implements OnInit {

  dragStart: Point2D;
  mouseIsDown: boolean;
  canvasManager: CanvasManager;
  mousePosition: Point2D = new Point2D;
  zoomScale: number;

  @Input() width: number;
  @Input() height: number;
  @ViewChild('canvas') canvas: ElementRef;
  @Output() canvasInitialized = new EventEmitter<CanvasManager>();
  @Output() zoom = new EventEmitter<number>();
  @Output() originMoved = new EventEmitter<Point2D>();

  ngOnInit() {
    if (this.width === undefined || this.height === undefined) {
      throw new Error("A valid width and height need to be provided to the draggable canvas.")
    }
  }

  ngAfterViewInit() {
    this.bindDragEvents();
    this.canvasManager = new CanvasManager(this.canvas.nativeElement);
    this.canvasInitialized.emit(this.canvasManager);
  }

  bindDragEvents() {
    this.canvas.nativeElement.addEventListener("mousemove", (e) => {
        this.mousemove(e.layerX, e.layerY)
    }, false);
    this.canvas.nativeElement.addEventListener("mousedown", (e) => {
        this.mousedown(e.layerX, e.layerY);
    }, false);
    this.canvas.nativeElement.addEventListener("mouseup", (e) => {
        this.mouseup();
    }, false);
    this.canvas.nativeElement.addEventListener("mouseout", (e) => {
        this.mouseup();
    }, false);

    this.canvas.nativeElement.addEventListener("touchmove", (e) => {
        this.mousemove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }, false);
    this.canvas.nativeElement.addEventListener("touchstart", (e) => {
        this.mousedown(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }, false);
    this.canvas.nativeElement.addEventListener("touchend", (e) => {
        this.mouseup();
    }, false);

    if (this.canvas.nativeElement.addEventListener) {
      this.canvas.nativeElement.addEventListener("wheel", (e) => this.handleMousescroll(e), false);
      this.canvas.nativeElement.addEventListener("DOMMouseScroll", (e) => this.handleMousescroll(e), false);
    }
    else
      this.canvas.nativeElement.attachEvent("onmousewheel", (e) => this.handleMousescroll(e));
  }

  handleMousescroll(e: any): boolean {
    e = window.event || e;
    e.stopPropagation();
    event.preventDefault();
    this.mousescroll(e.wheelDelta || -e.detail, this.mousePosition);

    return false;
  }

  updateScale(scale: number, focalPoint: Point2D) {
    let boundedScale = Math.max(0.5, Math.min(1500, this.canvasManager.scale * scale));

    this.canvasManager.setScale(boundedScale);
    this.zoom.emit(boundedScale);
  }

  mousescroll(pixels: number, mousePosition: Point2D) {
    if (pixels > 0)
      this.updateScale(1.1, mousePosition);

    else
      this.updateScale(1 / 1.1, mousePosition);
  }

  onPinchIn(event) {
    this.zoomScale = event.scale;
    this.updateScale(event.scale, new Point2D(event.center.x, event.center.y));
  }

  onPinchOut(event) {
    this.zoomScale = event.scale;
    this.updateScale(event.scale, new Point2D(event.center.x, event.center.y));
  }

  mousemove(x: number, y: number) {
    this.mousePosition.update(x, y);

    if (!this.mouseIsDown)
      return;

    let deltaX = x - this.dragStart.x,
        deltaY = y - this.dragStart.y;

    if (deltaX || deltaY) {
      this.canvasManager.shiftOrigin(deltaX, deltaY);
      this.dragStart = new Point2D(x, y);
      this.originMoved.emit(new Point2D(this.canvasManager.origin.x, this.canvasManager.origin.y));
    }
  }

  mouseup() {
    this.mouseIsDown = false;
  }

  mousedown(x: number, y: number) {
    this.mouseIsDown = true;
    this.dragStart = new Point2D(x, y);
  }

}