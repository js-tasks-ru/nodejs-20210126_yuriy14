module.exports.clearDocumentsHelper = function clearDocumentsHelper (documents, columns = [], secondNames = []) {
    return documents.map(document => {
        const doc = {};
        doc.id = document._id;

        columns.forEach(col => {
            doc[col] = document[col];
        });

        secondNames.forEach(secondName => {
            const {name:secondDocuments, columns:secondColumns} = secondName;
            
            if (document[secondDocuments]) {
                doc[secondDocuments] = clearDocumentsHelper(document[secondDocuments], secondColumns);
            }
        });

        return doc;
    });
}