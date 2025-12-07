import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export const FedPreset = definePreset(Aura, {
    semantic: {
        focusRing: {
            width: '1px',
            style: 'solid',
            color: '{primary.color}',
            offset: '1px',
            shadow: '0 0 0 2px color-mix(in srgb, {primary.color}, transparent 70%)'
        },
        formField: {
            paddingX: '1.25rem',
            paddingY: '0.75rem',
            sm: {
                fontSize: '{form.field.sm.font.size}',
                paddingX: '1rem',
                paddingY: '0.625rem'
            },
            lg: {
                fontSize: '{form.field.lg.font.size}',
                paddingX: '1.5rem',
                paddingY: '0.85rem'
            },
            borderRadius: '999px',
            transitionDuration: '0.25s',
            focusRing: {
                width: '{focus.ring.width}',
                style: '{focus.ring.style}',
                color: '{focus.ring.color}',
                offset: '{focus.ring.offset}',
                shadow: '{focus.ring.shadow}'
            }
        },
        content: {
            borderRadius: '1.75rem'
        },
        colorScheme: {
            light: {
                formField: {
                    background: '{surface.0}',
                    filledBackground: '{surface.50}',
                    hoverBorderColor: '{surface.400}',
                    focusBorderColor: '{primary.color}'
                },
                highlight: {
                    background: 'color-mix(in srgb, {primary.color}, transparent 88%)',
                    focusBackground: 'color-mix(in srgb, {primary.color}, transparent 80%)',
                    color: '{primary.900}',
                    focusColor: '{primary.900}'
                }
            },
            dark: {
                formField: {
                    background: '{surface.950}',
                    filledBackground: '{surface.800}',
                    hoverBorderColor: '{surface.400}',
                    focusBorderColor: '{primary.color}'
                },
                highlight: {
                    background: 'color-mix(in srgb, {primary.color}, transparent 70%)',
                    focusBackground: 'color-mix(in srgb, {primary.color}, transparent 60%)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        },
        primary: {
            50: '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}'
        }
    },
    components: {
        button: {
            root: {
                borderRadius: '1.75rem',
                roundedBorderRadius: '999px',
                paddingX: '1.25rem',
                paddingY: '0.65rem',
                gap: '0.5rem'
            }
        },
        inputtext: {
            root: {
                borderRadius: '{form.field.border.radius}'
            }
        },
        select: {
            root: {
                borderRadius: '{form.field.border.radius}',
                paddingX: '{form.field.padding.x}'
            },
            overlay: {
                borderRadius: '1.25rem'
            },
            option: {
                borderRadius: '1rem'
            }
        },
        menu: {
            root: {
                borderRadius: '1.75rem'
            },
            item: {
                borderRadius: '999px'
            }
        },
        multiselect: {
            root: {
                borderRadius: '{form.field.border.radius}',
                paddingX: '{form.field.padding.x}'
            },
            chip: {
                borderRadius: '999px'
            }
        },
        fileupload: {
            root: {
                borderRadius: '1.75rem'
            }
        },
        chip: {
            root: {
                borderRadius: '999px'
            }
        },
        dialog: {
            root: {
                borderRadius: '1.75rem'
            }
        },
        popover: {
            root: {
                borderRadius: '1.75rem'
            }
        },
        card: {
            root: {
                borderRadius: '1.75rem',
                shadow: '0 20px 35px -15px rgba(15, 23, 42, 0.35)'
            }
        },
        tag: {
            root: {
                borderRadius: '999px',
                padding: '0.15rem 0.75rem'
            }
        },
        toast: {
            root: {
                borderRadius: '1.75rem'
            },
            content: {
                padding: '1.25rem'
            }
        }
    },
    extend: {
        fed: {
            iconSize: {
                base: '1.35rem',
                lg: '1.75rem'
            }
        }
    },
    css: ({ dt }) => `
        .material-symbols-rounded {
            font-size: ${dt('fed.iconSize.lg')};
        }
    `
});
