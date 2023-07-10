<template>
  <DetectionLayout id="parent">
    <Card :active="active === '1'" @clicked="setActive('1')">1</Card>
    <Card :active="active === '2'" @clicked="setActive('2')">2</Card>
    <Card :active="active === '3'" @clicked="setActive('3')">3</Card>
  </DetectionLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from './Card.vue'
import { withDetection } from '../lib/Detection'

const DetectionLayout = withDetection('div')

const active = ref('1')
const setActive = (id: string) => active.value = id 

</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
}

#parent {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
}
</style>