<template>
  <div>
    <table>
      <thead>
      <tr>
        <th>Tool ID</th>
        <th>Group Name</th>
        <th>Type Name</th>
        <th>Material Name</th>
        <th>Radius</th>
        <th>Name</th>
        <th>Quantity in Stock</th>
        <th>Standard</th>
        <th>Order</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="tool in tools" :key="tool.tool_id">
        <td>{{ tool.tool_id }}</td>
        <td>{{ tool.group_name }}</td>
        <td>{{ tool.type_name }}</td>
        <td>{{ tool.mat_name }}</td>
        <td>{{ tool.rad }}</td>
        <td>{{ tool.name }}</td>
        <td>{{ tool.kolvo_sklad }}</td>
        <td>{{ tool.norma }}</td>
        <td>{{ tool.zakaz }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import pgPromise from 'pg-promise';

export default {
  data() {
    return {
      tools: [],
    };
  },
  async created() {
    const pgp = pgPromise();
    const db = pgp({
      host: 'your-host',
      port: 5432,
      database: 'your-database',
      user: 'your-username',
      password: 'your-password',
    });

    try {
      const tools = await db.any(`
        SELECT DISTINCT
          tool_num.id as tool_id,
          tool_num.name,
          tool_num.kolvo_sklad,
          tool_num.norma,
          tool_num.zakaz,
          tool_num.rad,
          tool_group_id.name as group_name,
          tool_mat_id.name as mat_name,
          tool_type_id.name as type_name
        FROM
          dbo.tool_num
        INNER JOIN
          dbo.tool_group_id ON dbo.tool_num.group_id = dbo.tool_group_id.id
        INNER JOIN
          dbo.tool_mat_id ON dbo.tool_num.mat_id = dbo.tool_mat_id.id
        INNER JOIN
          dbo.tool_type_id ON dbo.tool_num.type_id = dbo.tool_type_id.id
        LIMIT 20
      `);
      this.tools = tools;
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      pgp.end();  // Ensure to release the connection after use
    }
  },
};
</script>
