'use strict';

const chai = require('chai'),
  expect = chai.expect,
  Op = require('../../../../lib/operators'),
  QueryGenerator = require('../../../../lib/dialects/abstract/query-generator');

require(__dirname + '/../../support');

function quoteIdentifier(identifier) {
  return identifier;
}

function getQueryGenerator(sequelize) {
  return Object.assign(
      {},
      QueryGenerator,
      {options: sequelize.options, _dialect: sequelize.dialect, sequelize, quoteIdentifier}
    );
}

describe('QueryGenerator', () => {
  describe('whereItemQuery', () => {
    it('should generate correct query for Symbol operators', function() {

      const QG = getQueryGenerator(this.sequelize);
      QG.whereItemQuery(Op.or, [{test: {[Op.gt]: 5}}, {test: {[Op.lt]: 3}}, {test: {[Op.in]: [4]}}])
        .should.be.equal('(test > 5 OR test < 3 OR test IN (4))');

      QG.whereItemQuery(Op.and, [{test: {[Op.between]: [2, 5]}}, {test: {[Op.ne]: 3}}, {test: {[Op.not]: 4}}])
        .should.be.equal('(test BETWEEN 2 AND 5 AND test != 3 AND test != 4)');

    });

    it('should not parse any strings as aliases  operators', function() {
      const QG = getQueryGenerator(this.sequelize);
      expect(() => QG.whereItemQuery('$or', [{test: 5}, {test: 3}]))
        .to.throw();

      expect(() => QG.whereItemQuery('$and', [{test: 5}, {test: 3}]))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$gt: 5}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$between: [2, 5]}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$ne: 3}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$not: 3}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$in: [4]}))
        .to.throw();

    });

    it('should parse set aliases strings as operators', function() {
      const QG = getQueryGenerator(this.sequelize),
        aliases = {
          OR: Op.or,
          '!': Op.not,
          '^^': Op.gt
        };

      QG.setOperatorsAliases(aliases);

      QG.whereItemQuery('OR', [{test: {'^^': 5}}, {test: {'!': 3}}, {test: {[Op.in]: [4]}}])
        .should.be.equal('(test > 5 OR test != 3 OR test IN (4))');

      QG.whereItemQuery(Op.and, [{test: {[Op.between]: [2, 5]}}, {test: {'!': 3}}, {test: {'^^': 4}}])
        .should.be.equal('(test BETWEEN 2 AND 5 AND test != 3 AND test > 4)');

      expect(() => QG.whereItemQuery('OR', [{test: {'^^': 5}}, {test: {$not: 3}}, {test: {[Op.in]: [4]}}]))
        .to.throw();

      expect(() => QG.whereItemQuery('OR', [{test: {$gt: 5}}, {test: {'!': 3}}, {test: {[Op.in]: [4]}}]))
        .to.throw();

      expect(() => QG.whereItemQuery('$or', [{test: 5}, {test: 3}]))
        .to.throw();

      expect(() => QG.whereItemQuery('$and', [{test: 5}, {test: 3}]))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$gt: 5}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$between: [2, 5]}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$ne: 3}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$not: 3}))
        .to.throw();

      expect(() => QG.whereItemQuery('test', {$in: [4]}))
        .to.throw();

    });

  });
});

