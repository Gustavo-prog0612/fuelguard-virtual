# ELECHOUSE PN532 V4 model provenance

- Manufacturer documentation: https://www.elechouse.com/docs/pn532-v4/
- Manufacturer 3D archive: `../../../../../hardware/vendor-sources/elechouse-pn532-v4/ELECHOUSE_PN532_V4_3D.zip`
- Local source: `../../../../../hardware/vendor-sources/elechouse-pn532-v4/3D_NFC_EASY_SHIELD_V4.1_2025-12-13.step`
- Runtime asset: `/models/official/elechouse-pn532-v4.glb`
- Conversion: `node scripts/convert-step-to-glb.mjs <input.step> <output.glb>`
- Converter: `occt-import-js@0.0.23` with millimetre units and a 0.1 mm deflection.

The STEP import completed successfully with 335 meshes. OCCT reported 18 unresolved reference warnings while importing decorative/secondary references; the resulting bounds were checked against the module envelope (42.68 x 40.38 x 4.61 mm). The source STEP is retained so the conversion is auditable.
