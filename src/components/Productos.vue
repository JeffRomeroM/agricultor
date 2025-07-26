<template>
    <div>
      <h1>Productos El Agricultor</h1>
   

      <input v-model="busqueda" id="search" placeholder="Buscar productos..." />
      
      <div class="container">
        <div
          class="card"
          v-for="(item, i) in productosFiltrados"
          :key="i"
        >
          <h2>{{ item.Nombre }}</h2>
          <p><strong>Ingrediente Activo:</strong> {{ item.IngredienteActivo }}</p>
          <p><strong>Precio Recurrente:</strong> {{ item.PrecioRecurente }}</p>
          <p><strong>Precio Casual:</strong> {{ item.PrecioCasual }}</p>
          <p><strong>Existencias:</strong> {{ item.Existencias }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        productos: [],
        busqueda: ''
      };
    },
    computed: {
      productosFiltrados() {
        return this.productos.filter(item =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(this.busqueda.toLowerCase())
          )
        );
      }
    },
    mounted() {
      fetch("https://script.google.com/macros/s/AKfycbx0RNhJkdCr4lmFfQR3zSTOPKCyOJ8FwERz5jq5zP0EoVQJH9G46odjysXKcbvWPOoL/exec")
        .then(res => res.json())
        .then(result => {
        const data = result.data || result;
        this.productos = data.reverse(); // muestra los más recientes arriba
        })
        .catch(err => {
          console.error("Error al obtener los productos:", err);
        });
    }
  };
  </script>
  
<style scoped>
body {
  font-family: Arial, sans-serif;
  background: #f4f4f4;
  margin: 0;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
  color: #333;
}

#search {
  display: block;
  margin: 0 auto 20px auto;
  padding: 10px;
  width: 95%;
  max-width: 400px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 10px;
  box-sizing: border-box;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  width: 100%;
  box-sizing: border-box;
}

.card:hover {
  transform: translateY(-5px);
}

.card h2 {
  font-size: 20px;
  margin: 0 0 10px;
  color: #333;
}

.card p {
  margin: 6px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}



@media (max-width: 600px) {
  h1 {
    font-size: 1.5rem;
  }
  
  #search {
    font-size: 14px;
    padding: 8px;
  }
  .container {
    grid-template-columns: repeat(2, 1fr);

  }
  .card h2 {
    font-size: 18px;
  }

  .card p {
    font-size: 13px;
  }
}
</style>

  