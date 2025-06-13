<template>
    <div class="absolute z-50 px-4 w-full select-none bottom-4 flex justify-between">
        <div>
            <p class="text-white/50 font-thin text-[0.6rem]">
                <slot name="first">inspired by</slot>
                <span class="font-medium ml-3">
                    <slot name="second"></slot>
                </span>
            </p>
        </div>
        <div>
            <p class="text-white/50 font-medium text-[0.6rem]">
                <slot name="github"></slot>
            </p>
        </div>
    </div>
</template>
