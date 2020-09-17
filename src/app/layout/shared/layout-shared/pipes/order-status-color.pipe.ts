import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'orderStatusColor'
})
export class OrderStatusColorPipe implements PipeTransform {

  transform(value: number): string {
    let color = '';

    switch (value) {
      case 0:
        color = 'brown';
        break;
      case 2: case 8:
        color = 'red';
        break;
      case 1: case 3: case 5: case 6: case 7: case 9: case 10: case 11:
        color = 'green';
        break;
    }

    return color;
  }
}