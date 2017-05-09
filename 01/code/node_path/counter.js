let i = 0;

module.exports = (req, res) => {
    ++i; // будет увеличиваться с каждым запросом
    res.end(i.toString()); // Must be string
};
