function objectfyDataArray(dataArray, columns) {
    var objArray = [];
    for(let a=0;a<dataArray.length;a++) {
        var row = dataArray[a];
        if (row.length != dataArray.length)
            throw Error("Número de colunas incompatível entre o especificado e os dados")
        console.log("Colunas: "+row.length)
        var rowObj = {};
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            var column = columns[columnIndex];
            var value = row[columnIndex]
            console.log(column + ' = ' + value);
            rowObj[column] = value;
        }
        if(a > 100) break;
        objArray.push(rowObj);
    }
    return objArray;
}