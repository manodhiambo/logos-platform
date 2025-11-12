'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fix priority column: drop and recreate as INTEGER
    await queryInterface.removeColumn('announcements', 'priority');
    await queryInterface.addColumn('announcements', 'priority', {
      type: Sequelize.INTEGER,
      defaultValue: 3,
      allowNull: false,
    });
    
    // Add indexes if they don't exist (will skip if they already exist)
    try {
      await queryInterface.addIndex('announcements', ['author_id'], {
        name: 'announcements_author_id_idx'
      });
    } catch (e) {}
    
    try {
      await queryInterface.addIndex('announcements', ['status'], {
        name: 'announcements_status_idx'
      });
    } catch (e) {}
    
    try {
      await queryInterface.addIndex('announcements', ['is_global'], {
        name: 'announcements_is_global_idx'
      });
    } catch (e) {}
    
    try {
      await queryInterface.addIndex('announcements', ['published_at'], {
        name: 'announcements_published_at_idx'
      });
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('announcements', 'priority');
    await queryInterface.addColumn('announcements', 'priority', {
      type: Sequelize.STRING,
    });
  },
};
