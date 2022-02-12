const link = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

const createDB = link + '/createDB';

const getArticles = link + '/getArticles';
const addArticle = link + '/addArticle';
const getArticleById = link + '/getArticleById';
const updateArticle = link + '/updateArticle';
const deleteArticle = link + '/deleteArticle';

const referenceLink = link + '/articles';
const getReferences = referenceLink +'/getReferences';
const getReferenceById = referenceLink + '/getReferenceById';
const addReference = referenceLink + '/addReference';
const updateReference =  referenceLink + '/updateReference';
const deleteReference = referenceLink + '/updateReference';


