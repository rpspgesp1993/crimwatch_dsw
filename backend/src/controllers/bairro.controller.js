const Bairro = require('../models/bairro.model');
const Crime = require('../models/crime.model');

exports.listarBairrosComDensidade = async (req, res) => {
  try {
    const bairros = await Bairro.find().lean();

    const contagens = await Crime.aggregate([
      { $group: { _id: "$bairro", total: { $sum: 1 } } }
    ]);

    const densidadeMap = {};
    contagens.forEach(c => densidadeMap[c._id?.toString()] = c.total);

    const features = bairros.map(bairro => ({
      type: "Feature",
      geometry: bairro.geometria,
      properties: {
        id: bairro._id,
        nome: bairro.nome,
        municipio: bairro.municipio,
        densidade: densidadeMap[bairro._id?.toString()] || 0
      }
    }));

    res.json({
      type: "FeatureCollection",
      features
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Erro ao carregar bairros." });
  }
};
