import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'favFilter',
    pure: false
})
export class FavFilterPipe implements PipeTransform {
    transform(items: any[], arg: any): any {
        if(arg == 'Favourites')
        	return items.filter(item => item.Favorite);
        else
        	return items;
    }
}