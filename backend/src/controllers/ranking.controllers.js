const Crime = require('../models/crime.model');
const Bairro = require('../models/bairro.model');

exports.rankingCrimes = async (req, res) => {
  const ranking = await Crime.aggregate([
    { $group: { _id: "$bairro", total: { $sum: 1 } } },
    { $lookup: {
      from: 'bairros',
      localField: '_id',
      foreignField: '_id',
      as: 'bairro'
    }},
    { $unwind: "$bairro" },
    { $project: { nome: "$bairro.nome", total: 1 } },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]);
  res.json(ranking);
};
