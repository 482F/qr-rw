<template>
  <v-app>
    <v-main class="main">
      <suspense>
        <main-component />
      </suspense>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import MainComponent from './components/main-component.vue'
</script>

<style lang="scss">
* {
  font-family: 'Cica';
  &::-webkit-scrollbar-track {
    background-color: #eee;
  }
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 30px;
  }
}
</style>

<style lang="scss" scoped>
.main {
  display: flex;
  justify-content: center;
}
</style>
