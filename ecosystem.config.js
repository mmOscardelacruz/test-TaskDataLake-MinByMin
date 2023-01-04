module.exports = {
  apps: [
    {
      name: 'kof_data_lake_task',
      script: './dist/index.js',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max_old_space_size=8092'
      },
      env_production: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max_old_space_size=8092'
      }
    }
  ]
};