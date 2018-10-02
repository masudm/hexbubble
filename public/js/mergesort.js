//my mergesort takes an array of objects as well as a property to sort by
//this makes it slightly more confusing than most implementations
//but it is the same underlying algrorithm

//this is the main sort function that takes an array and a property to sort by
function sort(array, sortBy) {
    var length = array.length; //get the length of the array

    if (length == 1) { //when sorted (i.e. the element length is 1), just return the array
        return array; 
    }

    //get the middle element index
    var middle = Math.floor(length * 0.5);

    //split the array into left and right using the defined middle
    var left = array.slice(0, middle);
    var right = array.slice(middle, length);

    //run this recursively by merging this function into itself
    //also pass along the property to sort by
    return merge(sort(left, sortBy), sort(right, sortBy), sortBy);
}

//a merge function that takes the left and right parts of the array
//as well as a way to sort 
function merge(left, right, sortBy) {
    var sorted = []; //this is the array that will be returned

    //while there are elements to sort
    while (left.length || right.length) {

        //if both left and right arrays have elements
        if (left.length && right.length) {
            //check if 1st element of left or right is higher
            //and push to the sorted array
            if (left[0][sortBy] < right[0][sortBy]) {
                sorted.push(left.shift());
            } else {
                sorted.push(right.shift());
            }
        //if only right has elements, add the right elements since they are left
        } else if (right.length) {
            sorted.push(right.shift());
        } else {
            //only left array elements remain
            sorted.push(left.shift());
        }
    }

    return sorted;
}