<template>
  <div>
    <h1>Productos El Agricultor</h1>
    <div class="actions">
        <RouterLink to="/admin" class="link">Administrador</RouterLink>
    </div>
    <input v-model="busqueda" id="search" placeholder="Buscar productos..." />

    <!-- Loader -->
    <div v-if="cargando" class="loader-container">
      <div class="loader"></div>
      <span class="loader-text">Cargando productos...</span>
    </div>

    <div class="container" v-else>
      <div
        class="card"
        v-for="(item, i) in productosFiltrados"
        :key="i"
      >
        <h2>{{ item.Nombre }}</h2>
        <p><strong>Ingrediente Activo:</strong> {{ item.IngredienteActivo }}</p>
        <p><strong>Precio Recurrente:</strong> {{ item.PrecioRecurente }}</p>
        <p><strong>Precio Casual:</strong> {{ item.PrecioCasual }}</p>
        <p
          :class="{'stock-bajo': Number(item.Existencias) <= 5}"
        >
          <strong>Existencias:</strong> {{ item.Existencias }}
          <span v-if="Number(item.Existencias) <= 3" class="alerta-stock">¡Bajo!</span>
        </p>
      </div>
    </div>
  </div>
</template>
  
 <script>
export default {
  data() {
    return {
      productos: [],
      busqueda: '',
      cargando: true
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
        this.productos = data.reverse();
        this.cargando = false;
      })
      .catch(err => {
        console.error("Error al obtener los productos:", err);
        this.cargando = false;
      });
  }
};
</script>
  
<style>
/* ...existing code... */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0 30px 0;
}

.loader {
  border: 4px solid #e0e0e0;
  border-top: 4px solid #2ecc71;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}

.loader-text {
  color: #27ae60;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.stock-bajo {
  color: #e74c3c;
  font-weight: bold;
  position: relative;
}

.alerta-stock {
  background: #e74c3c;
  color: #fff;
  font-size: 0.85em;
  padding: 2px 8px;
  border-radius: 8px;
  margin-left: 8px;
  font-weight: 600;
  animation: parpadeo 1s infinite alternate;
}

@keyframes parpadeo {
  from { opacity: 1; }
  to { opacity: 0.5; }
}

.card {
  background: #fff;
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(44, 204, 113, 0.10), 0 1.5px 4px rgba(0,0,0,0.06);
  padding: 22px 18px 16px 18px;
  text-align: left;
  transition: transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(44, 204, 113, 0.18), 0 2px 8px rgba(0,0,0,0.10);
}

.card h2 {
  font-size: 1.25rem;
  margin: 0 0 10px;
  color: #2ecc71;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card p {
  margin: 8px 0;
  color: #444;
  font-size: 15px;
  line-height: 1.5;
  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 4px;
}

.card p:last-child {
  border-bottom: none;
}

#search {
  display: block;
  margin: 0 auto 24px auto;
  padding: 12px;
  width: 98%;
  max-width: 420px;
  font-size: 17px;
  border-radius: 10px;
  border: 1.5px solid #2ecc71;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}

#search:focus {
  border-color: #27ae60;
  background: #f8fff9;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 2.2rem;
  color: #27ae60;
  letter-spacing: 1px;
  font-weight: 800;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: linear-gradient(120deg, #f4f4f4 60%, #e8f9f1 100%);
  margin: 0;
  padding: 20px;
}

/* Responsive */
@media (max-width: 600px) {
  h1 {
    font-size: 1.4rem;
  }
  #search {
    font-size: 14px;
    padding: 9px;
  }
  .container {
    gap: 6px;
    grid-template-columns: repeat(2, 1fr);
   
  }
  .card {
    padding: 14px 10px 10px 10px;
  }
  .card h2 {
    font-size: 1.05rem;
  }
  .card p {
    font-size: 13px;
  }
}
/* ...existing code... */
</style>

  