<script setup>
import { ref, onMounted } from 'vue'
import useThreeScene from './composables/useThreeScene'

import LoadingIco from './components/LoadingIco.vue'
import PageWrap from './components/PageWrap.vue'
import Header from './components/Header.vue'
import FooterInfo from './components/FooterInfo.vue'

const webgl = ref(null)

const { initScene } = useThreeScene(webgl)

onMounted(() => {
    initScene()
})
</script>

<template>
    <PageWrap>
        <Header />
        <!-- <div v-if="loading" class="z-10 h-dvh inset-0 flex items-center justify-center">
                <LoadingIco />
            </div> -->

        <div class="outline-none w-full h-dvh" ref="webgl"></div>

        <FooterInfo>
            <template v-slot:first>
                <a
                    href="https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/"
                    target="_blank"
                    class="underline-offset-2 font-medium"
                    >Droplet by Yuki Kojima in Tutorials
                </a>
            </template>
            <template v-slot:second> </template>
            <template v-slot:github>
                <a href="https://github.com/pccathome/droplet" target="_blank" class="underline-offset-2">GitHub</a>
            </template>
        </FooterInfo>
    </PageWrap>
</template>
