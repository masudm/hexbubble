function sort(array, sortBy) {
    var length = array.length;

    if (length == 1) {
        return array;
    }

    var middle = Math.floor(length * 0.5);
    var left = array.slice(0, middle);
    var right = array.slice(middle, length);

    return merge(sort(left, sortBy), sort(right, sortBy), sortBy);
}

function merge(left, right, sortBy) {
    var sorted = [];

    while (left.length || right.length) {
        if (left.length && right.length) {
            if (left[0][sortBy] < right[0][sortBy]) {
                sorted.push(left.shift());
            } else {
                sorted.push(right.shift());
            }
        } else if (right.length) {
            sorted.push(right.shift());
        } else {
            sorted.push(left.shift());
        }
    }

    return sorted;
}