<template>
    <div v-if="!vertical" :class="sliderCls">
        <div
            ref="sliderEl"
            :class="wrapperClass"
            :style="props.style"
            :aria-label="ariaLabelText"
            @mouseenter="handleWrapperEnter"
            @mouseleave="handleWrapperLeave"
        >
            <div class="semi-slider-rail" :style="props.railStyle" @click="handleWrapClick" />
            <div :class="cssClasses.TRACK" :style="trackStyle" @click="handleWrapClick" />
            <div v-if="shouldRenderStepDot" :class="cssClasses.DOTS">
                <span
                    v-for="mark in Object.keys(marks || {})"
                    :key="mark"
                    :class="getMarkClass(Number(mark))"
                    :style="{ [stylePos]: `calc(${getMarkPercent(Number(mark)) * 100}% - 2px)` }"
                    @click="handleWrapClick"
                />
            </div>
            <Tooltip
                v-if="!range"
                :content="tipChildren.min"
                :show-arrow="showArrow"
                position="top"
                trigger="custom"
                :re-pos-key="minPercent"
                :visible="tooltipVisibleMin"
                :class-name="cssClasses.HANDLE + '-tooltip'"
            >
                <span
                    ref="minHandleEl"
                    :class="minHandleClass"
                    :style="{
                        [stylePos]: `${minPercent * 100}%`,
                        zIndex: chooseMovePos === 'min' && isDrag ? 2 : 1,
                    }"
                    role="slider"
                    :tabindex="disabled ? -1 : 0"
                    :aria-label="commonAria['aria-label']"
                    :aria-labelledby="commonAria['aria-labelledby']"
                    :aria-disabled="commonAria['aria-disabled']"
                    :aria-orientation="commonAria['aria-orientation']"
                    :aria-valuetext="
                        getAriaValueText ? getAriaValueText(currentValue as number, 0) : props['aria-valuetext']
                    "
                    :aria-valuenow="currentValue as number"
                    :aria-valuemax="max"
                    :aria-valuemin="min"
                    @mousedown="(e) => handleMouseDown(e, 'min')"
                    @mouseenter="() => handleMouseEnter('min')"
                    @touchstart="(e) => handleTouchStart(e, 'min')"
                    @mouseleave="handleMouseLeave"
                    @keyup="handleKeyUp"
                    @touchend="handleKeyUp"
                    @keydown="(e) => handleKeyDown(e, 'min')"
                    @focus="(e) => handleFocus(e, 'min')"
                    @blur="(e) => handleBlur(e, 'min')"
                    @mouseover="checkAndUpdateIsInRenderTreeState"
                >
                    <div
                        v-if="handleDotSingle"
                        :class="cssClasses.HANDLE_DOT"
                        :style="{
                            ...(handleDotSingle?.size
                                ? { width: handleDotSingle.size, height: handleDotSingle.size }
                                : {}),
                            ...(handleDotSingle?.color ? { backgroundColor: handleDotSingle.color } : {}),
                        }"
                    />
                </span>
            </Tooltip>
            <span
                v-if="false"
                ref="minHandleEl"
                :class="minHandleClass"
                :style="{
                    [stylePos]: `${minPercent * 100}%`,
                    zIndex: chooseMovePos === 'min' && isDrag ? 2 : 1,
                }"
                role="slider"
                :tabindex="disabled ? -1 : 0"
                :aria-label="commonAria['aria-label']"
                :aria-labelledby="commonAria['aria-labelledby']"
                :aria-disabled="commonAria['aria-disabled']"
                :aria-orientation="commonAria['aria-orientation']"
                :aria-valuetext="
                    getAriaValueText ? getAriaValueText(currentValue as number, 0) : props['aria-valuetext']
                "
                :aria-valuenow="currentValue as number"
                :aria-valuemax="max"
                :aria-valuemin="min"
                @mousedown="(e) => handleMouseDown(e, 'min')"
                @mouseenter="() => handleMouseEnter('min')"
                @touchstart="(e) => handleTouchStart(e, 'min')"
                @mouseleave="handleMouseLeave"
                @keyup="handleKeyUp"
                @touchend="handleKeyUp"
                @keydown="(e) => handleKeyDown(e, 'min')"
                @focus="(e) => handleFocus(e, 'min')"
                @blur="(e) => handleBlur(e, 'min')"
                @mouseover="checkAndUpdateIsInRenderTreeState"
            >
                <div
                    v-if="handleDotSingle"
                    :class="cssClasses.HANDLE_DOT"
                    :style="{
                        ...(handleDotSingle?.size ? { width: handleDotSingle.size, height: handleDotSingle.size } : {}),
                        ...(handleDotSingle?.color ? { backgroundColor: handleDotSingle.color } : {}),
                    }"
                />
            </span>
            <template v-if="range">
                <Tooltip
                    :content="tipChildren.min"
                    :show-arrow="showArrow"
                    position="top"
                    trigger="custom"
                    :re-pos-key="minPercent"
                    :visible="tooltipVisibleMin"
                    :class-name="cssClasses.HANDLE + '-tooltip'"
                >
                    <span
                        ref="minHandleEl"
                        :class="minHandleClass"
                        :style="{
                            [stylePos]: `${minPercent * 100}%`,
                            zIndex: chooseMovePos === 'min' ? 2 : 1,
                        }"
                        role="slider"
                        :tabindex="disabled ? -1 : 0"
                        :aria-label="commonAria['aria-label']"
                        :aria-labelledby="commonAria['aria-labelledby']"
                        :aria-disabled="commonAria['aria-disabled']"
                        :aria-orientation="commonAria['aria-orientation']"
                        :aria-valuetext="
                            getAriaValueText
                                ? getAriaValueText((currentValue as number[])[0], 0)
                                : props['aria-valuetext']
                        "
                        :aria-valuenow="(currentValue as number[])[0]"
                        :aria-valuemax="(currentValue as number[])[1]"
                        :aria-valuemin="min"
                        @mousedown="(e) => handleMouseDown(e, 'min')"
                        @mouseenter="() => handleMouseEnter('min')"
                        @touchstart="(e) => handleTouchStart(e, 'min')"
                        @mouseleave="handleMouseLeave"
                        @keyup="handleKeyUp"
                        @touchend="handleKeyUp"
                        @keydown="(e) => handleKeyDown(e, 'min')"
                        @focus="(e) => handleFocus(e, 'min')"
                        @blur="(e) => handleBlur(e, 'min')"
                    >
                        <div
                            v-if="handleDotArray && handleDotArray[0]"
                            :class="cssClasses.HANDLE_DOT"
                            :style="{
                                ...(handleDotArray[0]?.size
                                    ? { width: handleDotArray[0].size, height: handleDotArray[0].size }
                                    : {}),
                                ...(handleDotArray[0]?.color ? { backgroundColor: handleDotArray[0].color } : {}),
                            }"
                        />
                    </span>
                </Tooltip>
                <span
                    v-if="false"
                    ref="minHandleEl"
                    :class="minHandleClass"
                    :style="{
                        [stylePos]: `${minPercent * 100}%`,
                        zIndex: chooseMovePos === 'min' ? 2 : 1,
                    }"
                    role="slider"
                    :tabindex="disabled ? -1 : 0"
                    :aria-label="commonAria['aria-label']"
                    :aria-labelledby="commonAria['aria-labelledby']"
                    :aria-disabled="commonAria['aria-disabled']"
                    :aria-orientation="commonAria['aria-orientation']"
                    :aria-valuetext="
                        getAriaValueText ? getAriaValueText((currentValue as number[])[0], 0) : props['aria-valuetext']
                    "
                    :aria-valuenow="(currentValue as number[])[0]"
                    :aria-valuemax="(currentValue as number[])[1]"
                    :aria-valuemin="min"
                    @mousedown="(e) => handleMouseDown(e, 'min')"
                    @mouseenter="() => handleMouseEnter('min')"
                    @touchstart="(e) => handleTouchStart(e, 'min')"
                    @mouseleave="handleMouseLeave"
                    @keyup="handleKeyUp"
                    @touchend="handleKeyUp"
                    @keydown="(e) => handleKeyDown(e, 'min')"
                    @focus="(e) => handleFocus(e, 'min')"
                    @blur="(e) => handleBlur(e, 'min')"
                >
                    <div
                        v-if="handleDotArray && handleDotArray[0]"
                        :class="cssClasses.HANDLE_DOT"
                        :style="{
                            ...(handleDotArray[0]?.size
                                ? { width: handleDotArray[0].size, height: handleDotArray[0].size }
                                : {}),
                            ...(handleDotArray[0]?.color ? { backgroundColor: handleDotArray[0].color } : {}),
                        }"
                    />
                </span>
                <!-- Max handle -->
                <Tooltip
                    :content="tipChildren.max"
                    :show-arrow="showArrow"
                    position="top"
                    trigger="custom"
                    :re-pos-key="maxPercent"
                    :visible="tooltipVisibleMax"
                    :class-name="cssClasses.HANDLE + '-tooltip'"
                >
                    <span
                        ref="maxHandleEl"
                        :class="maxHandleClass"
                        :style="{
                            [stylePos]: `${maxPercent * 100}%`,
                            zIndex: chooseMovePos === 'max' ? 2 : 1,
                        }"
                        role="slider"
                        :tabindex="disabled ? -1 : 0"
                        :aria-label="commonAria['aria-label']"
                        :aria-labelledby="commonAria['aria-labelledby']"
                        :aria-disabled="commonAria['aria-disabled']"
                        :aria-orientation="commonAria['aria-orientation']"
                        :aria-valuetext="
                            getAriaValueText
                                ? getAriaValueText((currentValue as number[])[1], 1)
                                : props['aria-valuetext']
                        "
                        :aria-valuenow="(currentValue as number[])[1]"
                        :aria-valuemax="max"
                        :aria-valuemin="(currentValue as number[])[0]"
                        @mousedown="(e) => handleMouseDown(e, 'max')"
                        @mouseenter="() => handleMouseEnter('max')"
                        @touchstart="(e) => handleTouchStart(e, 'max')"
                        @mouseleave="handleMouseLeave"
                        @keyup="handleKeyUp"
                        @touchend="handleKeyUp"
                        @keydown="(e) => handleKeyDown(e, 'max')"
                        @focus="(e) => handleFocus(e, 'max')"
                        @blur="(e) => handleBlur(e, 'max')"
                    >
                        <div
                            v-if="handleDotArray && handleDotArray[1]"
                            :class="cssClasses.HANDLE_DOT"
                            :style="{
                                ...(handleDotArray[1]?.size
                                    ? { width: handleDotArray[1].size, height: handleDotArray[1].size }
                                    : {}),
                                ...(handleDotArray[1]?.color ? { backgroundColor: handleDotArray[1].color } : {}),
                            }"
                        />
                    </span>
                </Tooltip>
                <span
                    v-if="false"
                    ref="maxHandleEl"
                    :class="maxHandleClass"
                    :style="{
                        [stylePos]: `${maxPercent * 100}%`,
                        zIndex: chooseMovePos === 'max' ? 2 : 1,
                    }"
                    role="slider"
                    :tabindex="disabled ? -1 : 0"
                    :aria-label="commonAria['aria-label']"
                    :aria-labelledby="commonAria['aria-labelledby']"
                    :aria-disabled="commonAria['aria-disabled']"
                    :aria-orientation="commonAria['aria-orientation']"
                    :aria-valuetext="
                        getAriaValueText ? getAriaValueText((currentValue as number[])[1], 1) : props['aria-valuetext']
                    "
                    :aria-valuenow="(currentValue as number[])[1]"
                    :aria-valuemax="max"
                    :aria-valuemin="(currentValue as number[])[0]"
                    @mousedown="(e) => handleMouseDown(e, 'max')"
                    @mouseenter="() => handleMouseEnter('max')"
                    @touchstart="(e) => handleTouchStart(e, 'max')"
                    @mouseleave="handleMouseLeave"
                    @keyup="handleKeyUp"
                    @touchend="handleKeyUp"
                    @keydown="(e) => handleKeyDown(e, 'max')"
                    @focus="(e) => handleFocus(e, 'max')"
                    @blur="(e) => handleBlur(e, 'max')"
                >
                    <div
                        v-if="handleDotArray && handleDotArray[1]"
                        :class="cssClasses.HANDLE_DOT"
                        :style="{
                            ...(handleDotArray[1]?.size
                                ? { width: handleDotArray[1].size, height: handleDotArray[1].size }
                                : {}),
                            ...(handleDotArray[1]?.color ? { backgroundColor: handleDotArray[1].color } : {}),
                        }"
                    />
                </span>
            </template>
            <div
                v-if="showMarkLabel && marks && Object.keys(marks).length > 0"
                :class="cssClasses.MARKS + (vertical && verticalReverse ? '-reverse' : '')"
            >
                <span
                    v-for="mark in Object.keys(marks || {})"
                    v-show="isMarkActive(Number(mark))"
                    :key="mark"
                    :class="`semi-slider-mark${vertical && verticalReverse ? '-reverse' : ''}`"
                    :style="{ [stylePos]: `${getMarkPercent(Number(mark)) * 100}%` }"
                    @click="handleWrapClick"
                >
                    {{ marks[Number(mark)] }}
                </span>
            </div>
            <div :class="boundaryClass">
                <span class="semi-slider-boundary-min">{{ min }}</span>
                <span class="semi-slider-boundary-max">{{ max }}</span>
            </div>
        </div>
    </div>
    <div
        v-else
        ref="sliderEl"
        :class="wrapperClass"
        :style="props.style"
        :aria-label="ariaLabelText"
        @mouseenter="handleWrapperEnter"
        @mouseleave="handleWrapperLeave"
    >
        <div class="semi-slider-rail" :style="props.railStyle" @click="handleWrapClick" />
        <div :class="cssClasses.TRACK" :style="trackStyle" @click="handleWrapClick" />
        <div v-if="shouldRenderStepDot" :class="cssClasses.DOTS">
            <span
                v-for="mark in Object.keys(marks || {})"
                :key="mark"
                :class="getMarkClass(Number(mark))"
                :style="{ [stylePos]: `calc(${getMarkPercent(Number(mark)) * 100}% - 2px)` }"
                @click="handleWrapClick"
            />
        </div>
        <Tooltip
            v-if="!range"
            :content="tipChildren.min"
            :show-arrow="showArrow"
            position="top"
            trigger="custom"
            :re-pos-key="minPercent"
            :visible="isInRenderTree && (tipVisible.min || firstDotFocusVisible)"
            :class-name="cssClasses.HANDLE + '-tooltip'"
        >
            <span
                ref="minHandleEl"
                :class="minHandleClass"
                :style="{
                    [stylePos]: `${minPercent * 100}%`,
                    zIndex: chooseMovePos === 'min' && isDrag ? 2 : 1,
                }"
                role="slider"
                :tabindex="disabled ? -1 : 0"
                :aria-label="commonAria['aria-label']"
                :aria-labelledby="commonAria['aria-labelledby']"
                :aria-disabled="commonAria['aria-disabled']"
                :aria-orientation="commonAria['aria-orientation']"
                :aria-valuetext="
                    getAriaValueText ? getAriaValueText(currentValue as number, 0) : props['aria-valuetext']
                "
                :aria-valuenow="currentValue as number"
                :aria-valuemax="max"
                :aria-valuemin="min"
                @mousedown="(e) => handleMouseDown(e, 'min')"
                @mouseenter="() => handleMouseEnter('min')"
                @touchstart="(e) => handleTouchStart(e, 'min')"
                @mouseleave="handleMouseLeave"
                @keyup="handleKeyUp"
                @touchend="handleKeyUp"
                @keydown="(e) => handleKeyDown(e, 'min')"
                @focus="(e) => handleFocus(e, 'min')"
                @blur="(e) => handleBlur(e, 'min')"
                @mouseover="checkAndUpdateIsInRenderTreeState"
            >
                <div
                    v-if="handleDotSingle"
                    :class="cssClasses.HANDLE_DOT"
                    :style="{
                        ...(handleDotSingle?.size ? { width: handleDotSingle.size, height: handleDotSingle.size } : {}),
                        ...(handleDotSingle?.color ? { backgroundColor: handleDotSingle.color } : {}),
                    }"
                />
            </span>
        </Tooltip>
        <span
            v-if="false"
            ref="minHandleEl"
            :class="minHandleClass"
            :style="{
                [stylePos]: `${minPercent * 100}%`,
                zIndex: chooseMovePos === 'min' && isDrag ? 2 : 1,
            }"
            role="slider"
            :tabindex="disabled ? -1 : 0"
            :aria-label="commonAria['aria-label']"
            :aria-labelledby="commonAria['aria-labelledby']"
            :aria-disabled="commonAria['aria-disabled']"
            :aria-orientation="commonAria['aria-orientation']"
            :aria-valuetext="getAriaValueText ? getAriaValueText(currentValue as number, 0) : props['aria-valuetext']"
            :aria-valuenow="currentValue as number"
            :aria-valuemax="max"
            :aria-valuemin="min"
            @mousedown="(e) => handleMouseDown(e, 'min')"
            @mouseenter="() => handleMouseEnter('min')"
            @touchstart="(e) => handleTouchStart(e, 'min')"
            @mouseleave="handleMouseLeave"
            @keyup="handleKeyUp"
            @touchend="handleKeyUp"
            @keydown="(e) => handleKeyDown(e, 'min')"
            @focus="(e) => handleFocus(e, 'min')"
            @blur="(e) => handleBlur(e, 'min')"
            @mouseover="checkAndUpdateIsInRenderTreeState"
        >
            <div
                v-if="handleDotSingle"
                :class="cssClasses.HANDLE_DOT"
                :style="{
                    ...(handleDotSingle?.size ? { width: handleDotSingle.size, height: handleDotSingle.size } : {}),
                    ...(handleDotSingle?.color ? { backgroundColor: handleDotSingle.color } : {}),
                }"
            />
        </span>
        <template v-if="range">
            <Tooltip
                :content="tipChildren.min"
                :show-arrow="showArrow"
                position="top"
                trigger="custom"
                :re-pos-key="minPercent"
                :visible="tooltipVisibleMin"
                :class-name="cssClasses.HANDLE + '-tooltip'"
            >
                <span
                    ref="minHandleEl"
                    :class="minHandleClass"
                    :style="{
                        [stylePos]: `${minPercent * 100}%`,
                        zIndex: chooseMovePos === 'min' ? 2 : 1,
                    }"
                    role="slider"
                    :tabindex="disabled ? -1 : 0"
                    :aria-label="commonAria['aria-label']"
                    :aria-labelledby="commonAria['aria-labelledby']"
                    :aria-disabled="commonAria['aria-disabled']"
                    :aria-orientation="commonAria['aria-orientation']"
                    :aria-valuetext="
                        getAriaValueText ? getAriaValueText((currentValue as number[])[0], 0) : props['aria-valuetext']
                    "
                    :aria-valuenow="(currentValue as number[])[0]"
                    :aria-valuemax="(currentValue as number[])[1]"
                    :aria-valuemin="min"
                    @mousedown="(e) => handleMouseDown(e, 'min')"
                    @mouseenter="() => handleMouseEnter('min')"
                    @touchstart="(e) => handleTouchStart(e, 'min')"
                    @mouseleave="handleMouseLeave"
                    @keyup="handleKeyUp"
                    @touchend="handleKeyUp"
                    @keydown="(e) => handleKeyDown(e, 'min')"
                    @focus="(e) => handleFocus(e, 'min')"
                    @blur="(e) => handleBlur(e, 'min')"
                >
                    <div
                        v-if="handleDotArray && handleDotArray[0]"
                        :class="cssClasses.HANDLE_DOT"
                        :style="{
                            ...(handleDotArray[0]?.size
                                ? { width: handleDotArray[0].size, height: handleDotArray[0].size }
                                : {}),
                            ...(handleDotArray[0]?.color ? { backgroundColor: handleDotArray[0].color } : {}),
                        }"
                    />
                </span>
            </Tooltip>
            <span
                v-if="false"
                ref="minHandleEl"
                :class="minHandleClass"
                :style="{
                    [stylePos]: `${minPercent * 100}%`,
                    zIndex: chooseMovePos === 'min' ? 2 : 1,
                }"
                role="slider"
                :tabindex="disabled ? -1 : 0"
                :aria-label="commonAria['aria-label']"
                :aria-labelledby="commonAria['aria-labelledby']"
                :aria-disabled="commonAria['aria-disabled']"
                :aria-orientation="commonAria['aria-orientation']"
                :aria-valuetext="
                    getAriaValueText ? getAriaValueText((currentValue as number[])[0], 0) : props['aria-valuetext']
                "
                :aria-valuenow="(currentValue as number[])[0]"
                :aria-valuemax="(currentValue as number[])[1]"
                :aria-valuemin="min"
                @mousedown="(e) => handleMouseDown(e, 'min')"
                @mouseenter="() => handleMouseEnter('min')"
                @touchstart="(e) => handleTouchStart(e, 'min')"
                @mouseleave="handleMouseLeave"
                @keyup="handleKeyUp"
                @touchend="handleKeyUp"
                @keydown="(e) => handleKeyDown(e, 'min')"
                @focus="(e) => handleFocus(e, 'min')"
                @blur="(e) => handleBlur(e, 'min')"
            >
                <div
                    v-if="handleDotArray && handleDotArray[0]"
                    :class="cssClasses.HANDLE_DOT"
                    :style="{
                        ...(handleDotArray[0]?.size
                            ? { width: handleDotArray[0].size, height: handleDotArray[0].size }
                            : {}),
                        ...(handleDotArray[0]?.color ? { backgroundColor: handleDotArray[0].color } : {}),
                    }"
                />
            </span>
            <Tooltip
                :content="tipChildren.max"
                :show-arrow="showArrow"
                position="top"
                trigger="custom"
                :re-pos-key="maxPercent"
                :visible="isInRenderTree && (tipVisible.max || secondDotFocusVisible)"
                :class-name="cssClasses.HANDLE + '-tooltip'"
            >
                <span
                    ref="maxHandleEl"
                    :class="maxHandleClass"
                    :style="{
                        [stylePos]: `${maxPercent * 100}%`,
                        zIndex: chooseMovePos === 'max' ? 2 : 1,
                    }"
                    role="slider"
                    :tabindex="disabled ? -1 : 0"
                    :aria-label="commonAria['aria-label']"
                    :aria-labelledby="commonAria['aria-labelledby']"
                    :aria-disabled="commonAria['aria-disabled']"
                    :aria-orientation="commonAria['aria-orientation']"
                    :aria-valuetext="
                        getAriaValueText ? getAriaValueText((currentValue as number[])[1], 1) : props['aria-valuetext']
                    "
                    :aria-valuenow="(currentValue as number[])[1]"
                    :aria-valuemax="max"
                    :aria-valuemin="(currentValue as number[])[0]"
                    @mousedown="(e) => handleMouseDown(e, 'max')"
                    @mouseenter="() => handleMouseEnter('max')"
                    @touchstart="(e) => handleTouchStart(e, 'max')"
                    @mouseleave="handleMouseLeave"
                    @keyup="handleKeyUp"
                    @touchend="handleKeyUp"
                    @keydown="(e) => handleKeyDown(e, 'max')"
                    @focus="(e) => handleFocus(e, 'max')"
                    @blur="(e) => handleBlur(e, 'max')"
                >
                    <div
                        v-if="handleDotArray && handleDotArray[1]"
                        :class="cssClasses.HANDLE_DOT"
                        :style="{
                            ...(handleDotArray[1]?.size
                                ? { width: handleDotArray[1].size, height: handleDotArray[1].size }
                                : {}),
                            ...(handleDotArray[1]?.color ? { backgroundColor: handleDotArray[1].color } : {}),
                        }"
                    />
                </span>
            </Tooltip>
            <span
                v-if="false"
                ref="maxHandleEl"
                :class="maxHandleClass"
                :style="{
                    [stylePos]: `${maxPercent * 100}%`,
                    zIndex: chooseMovePos === 'max' ? 2 : 1,
                }"
                role="slider"
                :tabindex="disabled ? -1 : 0"
                :aria-label="commonAria['aria-label']"
                :aria-labelledby="commonAria['aria-labelledby']"
                :aria-disabled="commonAria['aria-disabled']"
                :aria-orientation="commonAria['aria-orientation']"
                :aria-valuetext="
                    getAriaValueText ? getAriaValueText((currentValue as number[])[1], 1) : props['aria-valuetext']
                "
                :aria-valuenow="(currentValue as number[])[1]"
                :aria-valuemax="max"
                :aria-valuemin="(currentValue as number[])[0]"
                @mousedown="(e) => handleMouseDown(e, 'max')"
                @mouseenter="() => handleMouseEnter('max')"
                @touchstart="(e) => handleTouchStart(e, 'max')"
                @mouseleave="handleMouseLeave"
                @keyup="handleKeyUp"
                @touchend="handleKeyUp"
                @keydown="(e) => handleKeyDown(e, 'max')"
                @focus="(e) => handleFocus(e, 'max')"
                @blur="(e) => handleBlur(e, 'max')"
            >
                <div
                    v-if="handleDotArray && handleDotArray[1]"
                    :class="cssClasses.HANDLE_DOT"
                    :style="{
                        ...(handleDotArray[1]?.size
                            ? { width: handleDotArray[1].size, height: handleDotArray[1].size }
                            : {}),
                        ...(handleDotArray[1]?.color ? { backgroundColor: handleDotArray[1].color } : {}),
                    }"
                />
            </span>
        </template>
        <div
            v-if="showMarkLabel && marks && Object.keys(marks).length > 0"
            :class="cssClasses.MARKS + (vertical && verticalReverse ? '-reverse' : '')"
        >
            <span
                v-for="mark in Object.keys(marks || {})"
                v-show="isMarkActive(Number(mark))"
                :key="mark"
                :class="`semi-slider-mark${vertical && verticalReverse ? '-reverse' : ''}`"
                :style="{ [stylePos]: `${getMarkPercent(Number(mark)) * 100}%` }"
                @click="handleWrapClick"
            >
                {{ marks[Number(mark)] }}
            </span>
        </div>
        <div :class="boundaryClass">
            <span class="semi-slider-boundary-min">{{ min }}</span>
            <span class="semi-slider-boundary-max">{{ max }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, type CSSProperties } from 'vue';
import classNames from 'classnames';
import { cssClasses } from '@douyinfe/semi-foundation/slider/constants';
import SliderFoundation, {
    type SliderAdapter,
    type SliderState as FoundationState,
} from '@douyinfe/semi-foundation/slider/foundation';
import Tooltip from '../tooltip';
import type { SliderProps, HandleDotConfig } from './interface';

const modelValue = defineModel<number | number[]>();

const props = withDefaults(defineProps<SliderProps>(), {
    disabled: false,
    showMarkLabel: true,
    tooltipOnMark: false,
    included: true,
    max: 100,
    min: 0,
    range: false,
    showArrow: true,
    step: 1,
    vertical: false,
    showBoundary: false,
    verticalReverse: false,
    // tooltipVisible 不设置默认值，保持 undefined
});

const emit = defineEmits<{
    change: [value: number | number[]];
    afterChange: [value: number | number[]];
    mouseup: [e: MouseEvent];
}>();

const sliderEl = ref<HTMLDivElement>();
const minHandleEl = ref<HTMLSpanElement>();
const maxHandleEl = ref<HTMLSpanElement>();
const dragging = ref<boolean[]>([false, false]);
const eventListenerSet = ref<Set<() => void>>(new Set());
const handleDownEventListenerSet = ref<Set<() => void>>(new Set());

/**
 * 获取初始值
 * 优先级：modelValue (v-model) > value (受控) > 默认值
 *
 * 注意：使用 v-model 时，通过给绑定的变量赋初始值即可
 * 例如：const value = ref(30); <Slider v-model="value" />
 */
const getInitialValue = () => {
    if (modelValue.value !== undefined) {
        return modelValue.value;
    }

    // 受控组件模式
    if (props.value !== undefined) {
        return props.value;
    }

    // 默认值
    return props.range ? [0, 0] : 0;
};

const state = reactive<FoundationState>({
    currentValue: getInitialValue(),
    min: props.min || 0,
    max: props.max || 100,
    focusPos: '',
    onChange: (value) => emit('change', value),
    disabled: props.disabled || false,
    chooseMovePos: '',
    isDrag: false,
    clickValue: 0,
    showBoundary: false,
    isInRenderTree: true,
    firstDotFocusVisible: false,
    secondDotFocusVisible: false,
});

const adapter: SliderAdapter = {
    getContext: (_key: string) => null,
    getContexts: () => ({}),
    getCache: (_key: string) => null,
    getCaches: () => ({}),
    setCache: (_key: string, _value: unknown) => {},

    getSliderLengths: () => {
        if (sliderEl.value) {
            const rect = sliderEl.value.getBoundingClientRect();
            const offsetParent = sliderEl.value.offsetParent;
            const offsetParentRect = offsetParent?.getBoundingClientRect();

            const offset = {
                x: offsetParentRect ? rect.left - offsetParentRect.left : sliderEl.value.offsetLeft,
                y: offsetParentRect ? rect.top - offsetParentRect.top : sliderEl.value.offsetTop,
            };
            return {
                sliderX: offset.x,
                sliderY: offset.y,
                sliderWidth: rect.width,
                sliderHeight: rect.height,
            };
        }
        return {
            sliderX: 0,
            sliderY: 0,
            sliderWidth: 0,
            sliderHeight: 0,
        };
    },
    getParentRect: () => {
        const parentObj = sliderEl.value?.offsetParent;
        if (!parentObj) {
            return undefined;
        }
        return parentObj.getBoundingClientRect();
    },
    getScrollParentVal: () => {
        const scrollParent = foundation.getScrollParent(sliderEl.value!);
        return {
            scrollTop: scrollParent.scrollTop,
            scrollLeft: scrollParent.scrollLeft,
        };
    },
    isEventFromHandle: (e: MouseEvent) => {
        const handles = [minHandleEl.value, maxHandleEl.value];
        let flag = false;
        handles.forEach((handle) => {
            if (!handle) {
                return;
            }
            if (handle.contains(e.target as Node)) {
                flag = true;
            }
        });
        return flag;
    },
    getOverallVars: () => ({
        dragging: dragging.value,
    }),
    updateDisabled: (disabled: boolean) => {
        state.disabled = disabled;
    },
    transNewPropsToState<K extends keyof FoundationState>(stateObj: Pick<FoundationState, K>, callback = () => {}) {
        Object.assign(state, stateObj);
        callback();
    },
    /**
     * 通知值变化
     * 自动更新 v-model 绑定的值，并触发 change 事件
     */
    notifyChange: (cbValue: number | number[]) => {
        const sortedValue = Array.isArray(cbValue) ? [...cbValue].sort((a, b) => a - b) : cbValue;
        modelValue.value = sortedValue;
        emit('change', sortedValue);
    },
    setDragging: (value: boolean[]) => {
        dragging.value = value;
    },
    updateCurrentValue: (value: number | number[]) => {
        if (value !== state.currentValue) {
            state.currentValue = value;
        }
    },
    setOverallVars: (_key: string, _value: unknown) => {},
    getMinHandleEl: () => minHandleEl.value!,
    getMaxHandleEl: () => maxHandleEl.value!,
    onHandleDown: (_e: MouseEvent) => {
        handleDownEventListenerSet.value.add(
            addEventListener(document.body, 'mousemove', foundation.onHandleMove, false)
        );
        handleDownEventListenerSet.value.add(addEventListener(window, 'mouseup', foundation.onHandleUp, false));
        handleDownEventListenerSet.value.add(
            addEventListener(document.body, 'touchmove', foundation.onHandleTouchMove, false)
        );
    },
    onHandleMove: (
        mousePos: number,
        isMin: boolean,
        stateChangeCallback = () => {},
        clickTrack = false,
        outPutValue?: number | number[]
    ) => {
        const sliderDOMIsInRenderTree = foundation.checkAndUpdateIsInRenderTreeState();
        if (!sliderDOMIsInRenderTree) {
            return;
        }

        const { value } = props;

        let finalOutPutValue = outPutValue;
        if (finalOutPutValue === undefined) {
            const moveValue = foundation.transPosToValue(mousePos, isMin);
            if (moveValue === false) {
                return;
            }
            finalOutPutValue = foundation.outPutValue(moveValue);
        }

        const { currentValue } = state;
        if (
            foundation.outPutValue(currentValue) !== finalOutPutValue &&
            JSON.stringify(foundation.outPutValue(currentValue)) !== JSON.stringify(finalOutPutValue)
        ) {
            if (!clickTrack && foundation.valueFormatIsCorrect(value)) {
                return false;
            }
            state.currentValue = finalOutPutValue;
            stateChangeCallback();
        }
    },
    setEventDefault: (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
    },
    setStateVal: <K extends keyof FoundationState>(name: K, val: FoundationState[K]) => {
        state[name] = val;
    },
    checkAndUpdateIsInRenderTreeState: () => {
        const sliderDOMIsInRenderTree = domIsInRenderTree(sliderEl.value!);
        if (sliderDOMIsInRenderTree !== state.isInRenderTree) {
            state.isInRenderTree = sliderDOMIsInRenderTree;
        }
        return sliderDOMIsInRenderTree;
    },
    onHandleEnter: (pos: FoundationState['focusPos']) => {
        state.focusPos = pos;
    },
    onHandleLeave: () => {
        state.focusPos = '';
    },
    onHandleUpBefore: (e: MouseEvent) => {
        emit('mouseup', e);
        e.stopPropagation();
        e.preventDefault();
        Array.from(handleDownEventListenerSet.value).forEach((clear) => clear());
        handleDownEventListenerSet.value.clear();
    },
    onHandleUpAfter: () => {
        const { currentValue } = state;
        const value = foundation.outPutValue(currentValue);
        emit('afterChange', value);
    },
    unSubscribeEventListener: () => {
        Array.from(eventListenerSet.value).forEach((clear) => clear());
    },
    getState: (key: keyof FoundationState) => state[key],
    getStates: () => state,
    getProp: <K extends keyof SliderProps>(key: K) => props[key],
    getProps: () => props,
    setState: (partialState: Partial<FoundationState>) => {
        Object.assign(state, partialState);
    },
    stopPropagation: (e: Event) => {
        try {
            e.stopPropagation();
            (e as any).stopImmediatePropagation?.();
        } catch {
            // ignore
        }
    },
    persistEvent: (_e: Event) => {
        // Vue 3 事件系统已自动处理，无需手动 persist
    },
};

const foundation = new SliderFoundation(adapter);

const stylePos = computed(() => (props.vertical ? 'top' : 'left'));
const percentInfo = computed(() => foundation.getMinAndMaxPercent(state.currentValue));
const minPercent = computed(() => percentInfo.value.min);
const maxPercent = computed(() => percentInfo.value.max);

/**
 * 实际使用的 tipFormatter
 * - null: 隐藏 tooltip
 * - 函数: 使用自定义格式化函数
 * - undefined: 使用默认格式化（直接显示值）
 */
const actualTipFormatter = computed((): SliderProps['tipFormatter'] => {
    if (props.tipFormatter === null) {
        return null;
    }
    return props.tipFormatter || ((value) => value);
});

const computedTipInfo = computed(() => {
    // 当 tooltipVisible 为 undefined 时，传递 undefined 而不是 false
    // 这样 foundation 可以根据 focusPos 和 formatter 来决定是否显示 tooltip
    const visible = props.tooltipVisible === undefined ? undefined : props.tooltipVisible && state.isInRenderTree;
    // 直接访问 state 中的响应式数据以确保 Vue 能追踪到依赖
    // 这样当 focusPos 或 currentValue 变化时，computed 会重新计算
    const focusPos = state.focusPos;
    const currentValue = state.currentValue;
    // 访问这些值以触发依赖追踪
    return foundation.computeHandleVisibleVal(visible, actualTipFormatter.value, props.range);
});

// 在 Vue 层面重新计算 tipVisible，确保能正确追踪 focusPos 的变化
// 注意：React 版本传递的是 tooltipVisible && isInRenderTree
// 当 tooltipVisible 为 undefined 时，结果是 false，但 foundation 的逻辑需要检查 typeof visible === 'undefined'
// 所以我们需要在 Vue 层面直接实现这个逻辑，不依赖 foundation
const tipVisible = computed(() => {
    // 强制访问 state.focusPos 以确保响应式追踪
    const focusPos = state.focusPos;
    console.log('[Slider] tipVisible computed triggered', {
        focusPos,
        tipFormatter: props.tipFormatter,
        tooltipVisible: props.tooltipVisible,
        isInRenderTree: state.isInRenderTree,
    });

    // 如果 tooltipVisible 明确设置为 true，则始终显示
    if (props.tooltipVisible === true && state.isInRenderTree) {
        const result = { min: true, max: true };
        console.log('[Slider] tipVisible computed (tooltipVisible=true)', result);
        return result;
    }

    // 如果 tooltipVisible 明确设置为 false，则不显示
    if (props.tooltipVisible === false) {
        const result = { min: false, max: false };
        console.log('[Slider] tipVisible computed (tooltipVisible=false)', result);
        return result;
    }

    // 如果 tipFormatter 为 null，则不显示
    if (props.tipFormatter === null) {
        const result = { min: false, max: false };
        console.log('[Slider] tipVisible computed (tipFormatter=null)', result);
        return result;
    }

    // 如果 tooltipVisible 为 undefined（未设置），且 tipFormatter 不是 null，根据 focusPos 决定
    // 这是默认行为：当有 formatter 时（包括默认的 formatter），hover 时显示 tooltip
    if (props.tooltipVisible === undefined) {
        const result = {
            min: focusPos === 'min',
            max: focusPos === 'max',
        };
        console.log('[Slider] tipVisible computed (tooltipVisible=undefined)', {
            result,
            focusPos,
            tipFormatter: props.tipFormatter,
            isInRenderTree: state.isInRenderTree,
        });
        return result;
    }

    // 兜底：根据 focusPos 决定
    const result = {
        min: focusPos === 'min',
        max: focusPos === 'max',
    };
    console.log('[Slider] tipVisible computed (fallback)', result);
    return result;
});

/**
 * Tooltip 内容
 * 确保 min 始终为字符串，max 可为 null（range 模式下）
 */
const tipChildren = computed(() => {
    const raw = computedTipInfo.value.tipChildren;
    const result = {
        min: raw.min != null ? String(raw.min) : '',
        max: raw.max != null ? String(raw.max) : null,
    };
    console.log('[Slider] tipChildren computed', result);
    return result;
});

// Tooltip 的 visible 状态（用于调试）
// 注意：必须直接访问 state.focusPos 以确保响应式追踪
const tooltipVisibleMin = computed(() => {
    // 直接访问 state 中的响应式属性以确保依赖追踪
    const focusPos = state.focusPos;
    const isInRenderTreeValue = state.isInRenderTree;
    const firstDotFocusVisibleValue = state.firstDotFocusVisible;
    console.log('[Slider] tooltipVisibleMin computed triggered', {
        focusPos,
        isInRenderTree: isInRenderTreeValue,
        firstDotFocusVisible: firstDotFocusVisibleValue,
    });
    // 访问 tipVisible 会触发它的重新计算
    const tipVisibleValue = tipVisible.value;
    const visible = isInRenderTreeValue && (tipVisibleValue.min || firstDotFocusVisibleValue);
    console.log('[Slider] tooltipVisibleMin computed result', {
        visible,
        isInRenderTree: isInRenderTreeValue,
        tipVisibleMin: tipVisibleValue.min,
        firstDotFocusVisible: firstDotFocusVisibleValue,
        tipChildrenMin: tipChildren.value.min,
        focusPos,
        tipFormatter: props.tipFormatter,
        tooltipVisible: props.tooltipVisible,
    });
    return visible;
});

const tooltipVisibleMax = computed(() => {
    // 直接访问 state 中的响应式属性以确保依赖追踪
    const focusPos = state.focusPos;
    const isInRenderTreeValue = state.isInRenderTree;
    const secondDotFocusVisibleValue = state.secondDotFocusVisible;
    const tipVisibleValue = tipVisible.value;
    const visible = isInRenderTreeValue && (tipVisibleValue.max || secondDotFocusVisibleValue);
    console.log('[Slider] tooltipVisibleMax computed', {
        visible,
        isInRenderTree: isInRenderTreeValue,
        tipVisibleMax: tipVisibleValue.max,
        secondDotFocusVisible: secondDotFocusVisibleValue,
        tipChildrenMax: tipChildren.value.max,
        focusPos,
    });
    return visible;
});

const minHandleClass = computed(() => {
    return classNames(cssClasses.HANDLE, {
        [`${cssClasses.HANDLE}-clicked`]: state.chooseMovePos === 'min' && state.isDrag,
    });
});

const maxHandleClass = computed(() => {
    return classNames(cssClasses.HANDLE, {
        [`${cssClasses.HANDLE}-clicked`]: state.chooseMovePos === 'max' && state.isDrag,
    });
});

const wrapperClass = computed(() => {
    return classNames(
        `${cssClasses.PREFIX}-wrapper`,
        {
            [`${cssClasses.PREFIX}-disabled`]: state.disabled,
            [`${cssClasses.VERTICAL}-wrapper`]: props.vertical,
            [`${cssClasses.PREFIX}-reverse`]: props.vertical && props.verticalReverse,
        },
        props.className
    );
});

const boundaryClass = computed(() => {
    return classNames(`${cssClasses.PREFIX}-boundary`, {
        [`${cssClasses.PREFIX}-boundary-show`]: props.showBoundary && state.showBoundary,
    });
});

const sliderCls = computed(() => {
    return classNames({
        [`${cssClasses.PREFIX}`]: !props.vertical,
        [cssClasses.VERTICAL]: props.vertical,
    });
});

const trackStyle = computed((): CSSProperties => {
    const { range, included, vertical } = props;
    if (!included) {
        return {};
    }

    if (!vertical) {
        return {
            width: range ? `${Math.abs(maxPercent.value - minPercent.value) * 100}%` : `${minPercent.value * 100}%`,
            left: range ? `${Math.min(minPercent.value, maxPercent.value) * 100}%` : '0',
        };
    }

    return {
        height: range ? `${Math.abs(maxPercent.value - minPercent.value) * 100}%` : `${minPercent.value * 100}%`,
        top: range ? `${Math.min(minPercent.value, maxPercent.value) * 100}%` : '0',
    };
});

const shouldRenderStepDot = computed(() => {
    return props.marks && Object.keys(props.marks).length > 0;
});

const commonAria = computed(() => {
    const aria: {
        'aria-label'?: string;
        'aria-labelledby'?: string;
        'aria-disabled': boolean;
        'aria-orientation'?: 'vertical' | 'horizontal';
    } = {
        'aria-label': props['aria-label'] ?? (props.disabled ? 'Disabled Slider' : undefined),
        'aria-labelledby': props['aria-labelledby'],
        'aria-disabled': props.disabled,
    };
    if (props.vertical) {
        aria['aria-orientation'] = 'vertical';
    }
    return aria;
});

const ariaLabelText = computed(() => {
    if (props.range) {
        const fixedCurrentValue = Array.isArray(state.currentValue)
            ? [...state.currentValue].sort()
            : state.currentValue;
        const getText = (value: number, index: number) => {
            return props.getAriaValueText ? props.getAriaValueText(value, index) : value;
        };
        return `Range: ${getText((fixedCurrentValue as number[])[0], 0)} to ${getText((fixedCurrentValue as number[])[1], 1)}`;
    }
    return undefined;
});

const handleDotSingle = computed(() => {
    return !Array.isArray(props.handleDot) ? (props.handleDot as HandleDotConfig | undefined) : undefined;
});

const handleDotArray = computed(() => {
    return Array.isArray(props.handleDot) ? (props.handleDot as HandleDotConfig[]) : undefined;
});

const {
    min,
    max,
    currentValue,
    chooseMovePos,
    isDrag,
    isInRenderTree,
    firstDotFocusVisible,
    secondDotFocusVisible,
    disabled,
} = state;

/**
 * 检查元素是否在渲染树中（可见）
 * 用于优化 tooltip 显示性能
 */
function domIsInRenderTree(e: HTMLElement) {
    if (!e) {
        return false;
    }
    return Boolean(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
}

/**
 * 添加事件监听器，并返回清理函数
 * 自动管理事件监听器的生命周期，防止内存泄漏
 */
function addEventListener<T extends keyof (HTMLElementEventMap & WindowEventMap)>(
    target: HTMLElement | Window,
    eventName: T,
    callback: EventListenerOrEventListenerObject,
    ...rests: (boolean | AddEventListenerOptions)[]
) {
    if (target.addEventListener) {
        target.addEventListener(eventName, callback, ...rests);
        const clearSelf = () => {
            target?.removeEventListener(eventName, callback);
            Promise.resolve().then(() => {
                eventListenerSet.value.delete(clearSelf);
            });
        };
        eventListenerSet.value.add(clearSelf);
        return clearSelf;
    } else {
        return () => {};
    }
}

function getMarkPercent(mark: number) {
    return (mark - props.min) / (props.max - props.min);
}

function getMarkClass(mark: number) {
    return classNames(`${cssClasses.PREFIX}-dot`, {
        [`${cssClasses.PREFIX}-dot-active`]: foundation.isMarkActive(mark) === 'active',
    });
}

function isMarkActive(mark: number) {
    return foundation.isMarkActive(mark);
}

function handleWrapClick(e: MouseEvent) {
    foundation.handleWrapClick(e);
}

function handleMouseDown(e: MouseEvent, handler: 'min' | 'max') {
    foundation.onHandleDown(e, handler);
}

function handleMouseEnter(pos: 'min' | 'max') {
    // 直接更新 focusPos，绕过 foundation 中的条件判断限制
    // foundation 的 onHandleEnter 有条件限制（!focusPos && pos !== focusPos），
    // 这会导致当 focusPos 已有值时无法更新，所以在这里直接处理
    console.log('[Slider] handleMouseEnter', { pos, disabled: state.disabled, currentFocusPos: state.focusPos });
    if (!state.disabled) {
        state.focusPos = pos;
        console.log('[Slider] focusPos updated to', state.focusPos);
    }
}

function handleMouseLeave() {
    foundation.onHandleLeave();
}

function handleKeyUp(e: KeyboardEvent | TouchEvent) {
    foundation.onHandleUp(e);
}

function handleTouchStart(e: TouchEvent, handler: 'min' | 'max') {
    foundation.onHandleTouchStart(e, handler);
}

function handleKeyDown(e: KeyboardEvent, handler: 'min' | 'max') {
    foundation.handleKeyDown(e, handler);
}

function handleFocus(e: FocusEvent, handler: 'min' | 'max') {
    foundation.onFocus(e, handler);
}

function handleBlur(e: FocusEvent, handler: 'min' | 'max') {
    foundation.onBlur(e, handler);
}

function handleWrapperEnter() {
    foundation.handleWrapperEnter();
}

function handleWrapperLeave() {
    foundation.handleWrapperLeave();
}

function checkAndUpdateIsInRenderTreeState() {
    foundation.checkAndUpdateIsInRenderTreeState();
}

/**
 * 监听 v-model 值变化
 * 当外部通过 v-model 更新值时，同步到内部状态
 */
watch(
    () => modelValue.value,
    (nextValue, prevValue) => {
        if (nextValue !== undefined && JSON.stringify(nextValue) !== JSON.stringify(prevValue)) {
            const prevStateValue = state.currentValue;
            foundation.handleValueChange(prevStateValue, nextValue);
        }
    },
    { deep: true }
);

/**
 * 监听受控组件模式下的 value 变化
 * 仅在未使用 v-model 时生效，保持向后兼容
 */
watch(
    () => props.value,
    (nextValue, prevValue) => {
        if (modelValue.value === undefined && JSON.stringify(nextValue) !== JSON.stringify(prevValue)) {
            const prevStateValue = state.currentValue;
            foundation.handleValueChange(prevStateValue, nextValue);
            emit('afterChange', nextValue!);
        }
    },
    { deep: true }
);

watch(
    () => props.disabled,
    (nextDisabled) => {
        foundation.handleDisabledChange(nextDisabled);
    }
);

onMounted(() => {
    foundation.init();
});

onUnmounted(() => {
    foundation.destroy();
});
</script>
