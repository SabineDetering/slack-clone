import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {


    /**
     * sorts a JSON array
     * @param array - JSON array to be sorted
     * @param prop - property used for sorting
     * @param direction - descending sorting order if 'desc', ascending otherwise
     * @returns - sorted JSON array
     */
    transform(array: any[], prop: string, direction?: string): any[] {
        if (array) {
            return array.sort((a, b) => {
                return (a[prop] < b[prop] ? -1 : 1) * (direction == 'desc' ? -1 : 1)
            });
        } else {
            return []
        }
    }
}