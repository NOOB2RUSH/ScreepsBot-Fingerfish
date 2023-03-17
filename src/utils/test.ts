



function testFunc(Array, element) {
    for (let i in Array) {
        if (Array[i] == element) {
            return true
        }
    }
    return false

}

var testArr = [1, 2, 3, 5, 6, 7, 8]
var code = testFunc(testArr, 4)
console.log(code);
