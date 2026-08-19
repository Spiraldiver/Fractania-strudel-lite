// src/generated/glsl.mjs
var PREAMBLE = String.raw`
// Fractania - Shared GLSL Preamble
uniform vec2 iResolution;
uniform float iTime;

// Fractal core
uniform int   uIterations;
uniform float uBailout;

// Camera
uniform float uZoom;
uniform float uFOV;

// Light
uniform vec3  uLightPos;

// Color / Scene
uniform float uAoStrength;
uniform int   uGradientMode;
uniform int   uDiffOrbitMethod;
uniform int   uEmOrbitMethod;
uniform int   uDiffMinIter;
uniform int   uDiffMaxIter;
uniform int   uEmMinIter;
uniform int   uEmMaxIter;
uniform vec3  uBgColor;
uniform float uBlackFill;
// EnvironmentLight HDRI background (bound from the fractal's Environmentlightop
// chain in the builder; UseSphericalBackground + EnvExposure are set, and
// BackgroundRotation defaults to 0 when unbound = no rotation).
uniform float UseSphericalBackground;
uniform vec3  BackgroundRotation;
uniform float EnvExposure;
uniform float EnvBgBlend;       // background blend: 0 = black (uBgColor), 1 = HDRI
uniform float UseEnvLighting;   // MASTER HDRI toggle (env light Useenvlight):
                                // gates BOTH the HDRI background AND the IBL.
uniform float EnvIntensity;     // IBL dimmer (env light Envintensity)
// Subsurface scattering (RayTK subsurfaceContrib port; params at the bottom
// of every renderer op, read hasattr-guarded -> defaults = disabled).
uniform float uSSSEnable;
uniform float uSSSStrength;
uniform vec3  uSSSColor;
uniform float uSSSDensity;
uniform float uSSSExponent;
uniform float uSSSThickness;
uniform float uSSSScatter;
uniform float uSSSSamples;
// CameraViewport / world-matrix camera mode (pushed by cam_uniform_push).
// When uCamUseXform > 0.5 the ray origin + basis come 1:1 from the referenced
// camera's worldTransform (which includes the palette cameraViewport's
// pre-xform "Xform Matrix" where ALL its navigation state lives), so every
// tumble/pan/dolly/roll/WASD/preset behaves exactly like a normal 3D scene.
uniform float uCamUseXform;
uniform float uCamXformFov;     // VERTICAL fov in degrees (pre-converted CPU-side)
uniform vec3  uCamXformR;       // world right  (+X column)
uniform vec3  uCamXformU;       // world up     (+Y column)
uniform vec3  uCamXformF;       // world FORWARD (-Z column, pre-negated CPU-side)
uniform vec3  uCamXformP;       // world position
uniform float uDiffuseHue;
uniform float uDiffusePeriod;
uniform float uDiffuseOffset;
uniform float uEmissionHue;
uniform float uEmissionPeriod;
uniform float uEmissionOffset;
uniform float uEmissionThreshold;
uniform float uSelfIllumination;
uniform vec3  uDiffColor1;
uniform vec3  uDiffColor2;
uniform vec3  uEmColor;

// Pre-iteration transforms
uniform vec3  uPreRotation;
uniform vec3  uRotateFractal;

// Transform
uniform vec3  uOffset;
uniform float uScale;
uniform float uZRadius;
uniform vec3  uTranslate;

// === SLOT_UNIFORMS_BEGIN ===
// Transform Slot Uniforms - 6 slots, each: type (float) + 6 x vec4 params
uniform float uSlot0Type;
uniform vec4 uSlot0A; uniform vec4 uSlot0B; uniform vec4 uSlot0C; uniform vec4 uSlot0D; uniform vec4 uSlot0E; uniform vec4 uSlot0F;
uniform float uSlot1Type;
uniform vec4 uSlot1A; uniform vec4 uSlot1B; uniform vec4 uSlot1C; uniform vec4 uSlot1D; uniform vec4 uSlot1E; uniform vec4 uSlot1F;
uniform float uSlot2Type;
uniform vec4 uSlot2A; uniform vec4 uSlot2B; uniform vec4 uSlot2C; uniform vec4 uSlot2D; uniform vec4 uSlot2E; uniform vec4 uSlot2F;
uniform float uSlot3Type;
uniform vec4 uSlot3A; uniform vec4 uSlot3B; uniform vec4 uSlot3C; uniform vec4 uSlot3D; uniform vec4 uSlot3E; uniform vec4 uSlot3F;
uniform float uSlot4Type;
uniform vec4 uSlot4A; uniform vec4 uSlot4B; uniform vec4 uSlot4C; uniform vec4 uSlot4D; uniform vec4 uSlot4E; uniform vec4 uSlot4F;
uniform float uSlot5Type;
uniform vec4 uSlot5A; uniform vec4 uSlot5B; uniform vec4 uSlot5C; uniform vec4 uSlot5D; uniform vec4 uSlot5E; uniform vec4 uSlot5F;
// === SLOT_UNIFORMS_END ===

// === FOLD_SLOT_UNIFORMS_BEGIN ===
uniform float uFold0Type;
uniform vec4 uFold0A; uniform vec4 uFold0B;
uniform float uFold1Type;
uniform vec4 uFold1A; uniform vec4 uFold1B;
uniform float uFold2Type;
uniform vec4 uFold2A; uniform vec4 uFold2B;
uniform float uFold3Type;
uniform vec4 uFold3A; uniform vec4 uFold3B;
uniform float uFold4Type;
uniform vec4 uFold4A; uniform vec4 uFold4B;
uniform float uFold5Type;
uniform vec4 uFold5A; uniform vec4 uFold5B;
// === FOLD_SLOT_UNIFORMS_END ===

// === VARIANT_SLOT_UNIFORMS_BEGIN ===
// Per-slot variant index. Bound from the wired transform/fold op's
// \`Variantix\` int param (which mirrors the Variant Menu's menuIndex).
// applySlotTransform / applySlotFold receive this as \`int vi\` so each
// family can branch its variants in a single snippet body.
uniform float uSlot0Vi; uniform float uSlot1Vi; uniform float uSlot2Vi;
uniform float uSlot3Vi; uniform float uSlot4Vi; uniform float uSlot5Vi;
uniform float uFold0Vi; uniform float uFold1Vi; uniform float uFold2Vi;
uniform float uFold3Vi; uniform float uFold4Vi; uniform float uFold5Vi;
// === VARIANT_SLOT_UNIFORMS_END ===

// Epsilon + march steps
uniform float uEpsilon;
uniform int   uMaxSteps;
uniform float uMaxDist;     // far-plane / max ray distance

// Raytracer PBR
uniform int   uRenderMode;
uniform float uShadowSoft;
uniform float uDiffuseStr;
uniform float uSpecularStr;
uniform float uReflection;
uniform float uMetallic;
uniform float uRoughness;
uniform int   uPTBounces;
uniform float uPTGIStr;
uniform float uPTEmMult;

// Raymarcher: per-renderer step budgets (Raymarcher operators Shadows page)
uniform int   uShadowSteps;   // softShadow iteration cap (4..64)
uniform int   uAoSteps;       // AO samples along normal (1..8)

// Temporal / Super-sampling AA (driven by Render operators Tempaa + Taasamples)
uniform float uTaaSamples;    // effective per-pixel sample count (1..16)

// Camera (external)
uniform int   uCamMode;
uniform vec3  uCamPos;
uniform vec3  uCamRot;
uniform int   uCamOrbit;
uniform int   uDofEnabled;
uniform float uAperture;
uniform float uFocalDist;

// Equirectangular Camera mode (driven by Cameraop ref when an
// EquirectangularCamera op is wired in instead of a Camera op).
// \`_add_scalar\` plumbs these as float vec-slot uniforms; declared here
// so GLSL_MAIN compiles regardless of which Camera variant is wired.
uniform float UseEquirectangularCamera;
uniform float EquirectangularFOV;
uniform float EquirectangularBlend;

// Background composite
uniform int   uCompEnabled;
uniform float uCompScale;
uniform vec2  uCompTranslate;
uniform float uCompRotate;
uniform float uCompAlpha;

// Mouse interaction
uniform vec4  uMouse; // xy = current pos, zw = click pos (normalized)

// Volume rendering 
uniform float uSoftness;

// Gradient texture override flags (1 = use uEmissionTex instead of procedural)
uniform int uUseDiffuseGradient;
uniform int uUseEmissionGradient;

vec2 gFractDiffuseUV = vec2(0.5);
vec2 gFractEmissionUV = vec2(0.5);

out vec4 fragColor;
vec4 fragDepth;
vec4 fragEmission;

const float PI        = 3.14159265;
const int   MAX_ITERS = 32;
const int   MAX_STEPS = 512;
#define MAX_DIST uMaxDist
const float CAM_DIST  = 4.0;

// -- EnvironmentLight HDRI background (operators) ---------------------------------
// The fractal's env HDRI is delivered on a FIXED input slot appended by
// the builder after the gradient/signal/tex_input slots:
//   uEmissionTex  = 1x1 black pad (grad_fallback)
//   uDiffuseTex     = diffuse gradient
//   uEmissionTex     = emission gradient
//   uEmissionTex = 13 signal slots
//   uEmissionTex    = tex_input (TextureTransform)
//   uEmissionTex    = env_input  <-- HDRI equirect, or 1x1 black fallback
// When no EnvironmentLight/HDRI is wired, env_input resolves to the 1x1
// black grad_fallback, frHasEnvMap() is false, and frBackground() returns
// the flat uBgColor exactly as before (zero behavioural change).
#define FR_ENV_SLOT 23
bool frHasEnvMap(){ return textureSize(uEmissionTex, 0).x > 1; }
vec3 frEnvSample(vec3 dir){
    vec3 r = radians(BackgroundRotation);
    mat3 Rx = mat3(1.0,0.0,0.0, 0.0,cos(r.x),-sin(r.x), 0.0,sin(r.x),cos(r.x));
    mat3 Ry = mat3(cos(r.y),0.0,sin(r.y), 0.0,1.0,0.0, -sin(r.y),0.0,cos(r.y));
    mat3 Rz = mat3(cos(r.z),-sin(r.z),0.0, sin(r.z),cos(r.z),0.0, 0.0,0.0,1.0);
    // Baked 180° X flip (USER SPEC 2026-07-07): Background Rotate (0,0,0)
    // now maps like the old (180,0,0) — the natural upright orientation —
    // so fresh env lights spawn correct without touching the rotation.
    vec3 d0 = normalize(dir);
    d0 = vec3(d0.x, -d0.y, -d0.z);
    vec3 d = normalize(Rz*Ry*Rx*d0);
    float u = 0.5 + atan(d.z, d.x) / (2.0*PI);
    float v = 0.5 - asin(clamp(d.y, -1.0, 1.0)) / PI;
    vec3 c = texture(uEmissionTex, vec2(u, v)).rgb;
    return c * exp2(EnvExposure);
}
// Background for a ray that misses the fractal. Gated by the MASTER
// "Use Environment Light" toggle + "Use Sphere Background"; blends between
// uBgColor (black) and the HDRI by EnvBgBlend (0=black .. 1=full HDRI).
vec3 frBackground(vec3 dir){
    if (UseEnvLighting > 0.5 && UseSphericalBackground > 0.5 && frHasEnvMap())
        return mix(uBgColor, frEnvSample(dir), clamp(EnvBgBlend, 0.0, 1.0));
    return uBgColor;
}
// Image-based lighting: the fractal RECEIVES light from the HDRI when an
// EnvironmentLight is wired (UseEnvLighting) and a map is present. Both
// return 0 otherwise, so non-env fractals are unchanged.
//   frEnvIrradiance(n) = soft diffuse ambient (5-tap hemisphere average)
//   frEnvReflect(dir)  = sharp specular reflection along dir
vec3 frEnvIrradiance(vec3 n){
    if (UseEnvLighting < 0.5 || !frHasEnvMap()) return vec3(0.0);
    vec3 up = abs(n.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0);
    vec3 tx = normalize(cross(up, n));
    vec3 bx = cross(n, tx);
    vec3 acc = frEnvSample(n)
             + frEnvSample(normalize(n + tx*0.7))
             + frEnvSample(normalize(n - tx*0.7))
             + frEnvSample(normalize(n + bx*0.7))
             + frEnvSample(normalize(n - bx*0.7));
    return (acc * 0.2) * EnvIntensity;
}
vec3 frEnvReflect(vec3 dir){
    if (UseEnvLighting < 0.5 || !frHasEnvMap()) return vec3(0.0);
    return frEnvSample(dir) * EnvIntensity;
}

// -- Rotation helpers --
mat3 rotX(float a){float s=sin(a),c=cos(a);return mat3(1,0,0,0,c,-s,0,s,c);}
mat3 rotY(float a){float s=sin(a),c=cos(a);return mat3(c,0,s,0,1,0,-s,0,c);}
mat3 rotZ(float a){float s=sin(a),c=cos(a);return mat3(c,-s,0,s,c,0,0,0,1);}
vec3 RotatePosition(vec3 z, vec3 rot) {
    float sXY=sin(radians(rot.x)),cXY=cos(radians(rot.x));
    float sYZ=sin(radians(rot.y)),cYZ=cos(radians(rot.y));
    float sXZ=sin(radians(rot.z)),cXZ=cos(radians(rot.z));
    float t;
    t=z.y; z.y=cYZ*t+sYZ*z.z; z.z=-sYZ*t+cYZ*z.z;
    t=z.x; z.x=cXZ*t-sXZ*z.z; z.z= sXZ*t+cXZ*z.z;
    t=z.x; z.x=cXY*t+sXY*z.y; z.y=-sXY*t+cXY*z.y;
    return z;
}
// -- Shared SDF primitives / bulb helpers (used by v2 fractals) --
float cube_sdf3d(vec3 p, vec3 s) {
    vec3 q = abs(p) - s;
    return length(max(q, 0.0));
}
vec3 triplexPow(vec3 z, float power, float phase) {
    float r = length(z);
    float theta = atan(z.y, z.x);
    float phi = acos(clamp(z.z / max(r, 1e-12), -1.0, 1.0));
    r = pow(r, power);
    theta *= power;
    phi = phi * power + phase;
    return vec3(r*sin(phi)*cos(theta), r*sin(phi)*sin(theta), r*cos(phi));
}
vec3 triplexMul(vec3 n1, vec3 n2, float r1, float theta1, float phi1) {
    float r2 = length(n2);
    float theta2 = atan(n2.y, n2.x);
    float phi2 = asin(n2.z / max(r2, 1e-12));
    float r = r1 * r2;
    float theta = theta1 + theta2;
    float phi = phi1 + phi2;
    return vec3(r*cos(theta)*cos(phi), r*sin(theta)*cos(phi), r*sin(phi));
}
void powN1(inout vec3 z, float r, inout float dr, float P, float thS, float phS, bool fix) {
    float theta = acos(clamp(z.z/max(r,1e-8), -1.0, 1.0));
    float phi   = atan(z.y, z.x);
    dr = pow(r, P-1.0)*P*dr + 1.0;
    float zr = pow(r, P);
    theta = theta*P + thS;
    phi   = phi*P + phS;
    vec3 dir = fix ? vec3(sin(theta)*cos(phi), sin(phi), cos(theta))
                   : vec3(sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta));
    z = zr * dir;
}
void powN2(inout vec3 z, float zr0, inout float dr, float P, float thS, float phS, float derivBias) {
    float zo0 = asin(clamp(z.z/max(zr0,1e-8), -1.0, 1.0));
    float zi0 = atan(z.y, z.x);
    float zr  = pow(zr0, P-1.0);
    float zo  = zo0*P + thS;
    float zi  = zi0*P + phS;
    dr = max(dr*derivBias, zr*dr*P + 1.0);
    zr *= zr0;
    z = zr * vec3(cos(zo)*cos(zi), cos(zo)*sin(zi), sin(zo));
}

// -- Color helpers --
vec3 hsv2rgb(vec3 c) {
    vec3 rgb=clamp(abs(mod(c.x*6.0+vec3(0,4,2),6.0)-3.0)-1.0,0.0,1.0);
    rgb=rgb*rgb*(3.0-2.0*rgb);
    return c.z*mix(vec3(1.0),rgb,c.y);
}
vec3 rgb2hsv(vec3 c) {
    vec4 K=vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);
    vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));
    vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
    float d=q.x-min(q.w,q.y); float e=1.0e-10;
    return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);
}
vec3 gradient(float v, int mode) {
    v=clamp(v,0.0,1.0);
    if (mode==0) return vec3(v);
    else if (mode==1) {
        vec3 a=vec3(0.05,0,0),b=vec3(0.75,0.1,0),c=vec3(1,0.75,0.15),d=vec3(1);
        vec3 col=mix(a,b,smoothstep(0.0,0.35,v));
        col=mix(col,c,smoothstep(0.35,0.75,v));
        return mix(col,d,smoothstep(0.75,1.0,v));
    } else if (mode==2) {
        vec3 base=0.5+0.5*cos(6.28318*(vec3(0,0.33,0.67)+v));
        return mix(vec3(v),base,0.85);
    } else { return hsv2rgb(vec3(0.9-0.9*v,0.85,0.95)); }
}
`;
var STUBS = String.raw`
// Transform slot dispatcher - dynamically composed from connected operators
vec3 applySlotTransform(vec3 z, int tp, int vi, vec4 A, vec4 B, vec4 C, vec4 D, vec4 E, vec4 F) {
    // no transforms connected
    return z;
}

vec3 DE_applyTransforms(vec3 z) {
    z = applySlotTransform(z, int(uSlot0Type), int(uSlot0Vi), uSlot0A, uSlot0B, uSlot0C, uSlot0D, uSlot0E, uSlot0F);
    z = applySlotTransform(z, int(uSlot1Type), int(uSlot1Vi), uSlot1A, uSlot1B, uSlot1C, uSlot1D, uSlot1E, uSlot1F);
    z = applySlotTransform(z, int(uSlot2Type), int(uSlot2Vi), uSlot2A, uSlot2B, uSlot2C, uSlot2D, uSlot2E, uSlot2F);
    z = applySlotTransform(z, int(uSlot3Type), int(uSlot3Vi), uSlot3A, uSlot3B, uSlot3C, uSlot3D, uSlot3E, uSlot3F);
    z = applySlotTransform(z, int(uSlot4Type), int(uSlot4Vi), uSlot4A, uSlot4B, uSlot4C, uSlot4D, uSlot4E, uSlot4F);
    z = applySlotTransform(z, int(uSlot5Type), int(uSlot5Vi), uSlot5A, uSlot5B, uSlot5C, uSlot5D, uSlot5E, uSlot5F);
    return z;
}

// Fold slot dispatcher - dynamically composed from connected operators
void applySlotFold(inout vec3 z, inout float dr, int tp, int vi, vec4 A, vec4 B) {
    if (tp == 0) return;
    // no folds connected
}

void DE_applyFolds(inout vec3 z, inout float dr) {
    applySlotFold(z, dr, int(uFold0Type), int(uFold0Vi), uFold0A, uFold0B);
    applySlotFold(z, dr, int(uFold1Type), int(uFold1Vi), uFold1A, uFold1B);
    applySlotFold(z, dr, int(uFold2Type), int(uFold2Vi), uFold2A, uFold2B);
    applySlotFold(z, dr, int(uFold3Type), int(uFold3Vi), uFold3A, uFold3B);
    applySlotFold(z, dr, int(uFold4Type), int(uFold4Vi), uFold4A, uFold4B);
    applySlotFold(z, dr, int(uFold5Type), int(uFold5Vi), uFold5A, uFold5B);
}
`;
var TRANSFORMS = String.raw`
// Transform slot dispatcher - reads from connected Transform operators via vec4 uniforms
// Each slot: type (int from uSlotNType), variant index \`vi\` (from uSlotNVi),
// params in 4 vec4s (A=0-3, B=4-7, C=8-11, D=12-15)
vec3 applySlotTransform(vec3 z, int tp, int vi, vec4 A, vec4 B, vec4 C, vec4 D, vec4 E, vec4 F) {
    if (tp == 1) {
        // Tunnel: 3-axis domain repetition
        for (int ax = 0; ax < 3; ax++) {
            float sc, of, sl, bl;
            if (ax == 0) { sc=A.x; of=A.y; sl=A.z; bl=A.w; }
            else if (ax == 1) { sc=B.x; of=B.y; sl=B.z; bl=B.w; }
            else { sc=C.x; of=C.y; sl=C.z; bl=C.w; }
            if (sc > 0.001) {
                vec3 rr = z;
                float comp = (ax==0) ? z.x : (ax==1) ? z.y : z.z;
                float period = sc * 2.0;
                float rep = comp - period * floor((comp + of) / period + 0.5);
                float result = mix(rep, comp, clamp(sl, 0.0, 1.0));
                if (ax==0) rr.x = result; else if (ax==1) rr.y = result; else rr.z = result;
                z = mix(z, rr, clamp(bl, 0.0, 1.0));
            }
        }
    } else if (tp == 2) {
        // LowRes: pixelation
        float bl = A.x, sc2 = A.y;
        z *= sc2; vec3 wi = round(z); vec3 wf = z - wi;
        z = mix(z/sc2, (16.0*wf*wf*wf*wf*wf + wi)/sc2, bl);
    } else if (tp == 3) {
        // Kaleidoscope: 3-plane kaleidoscopic symmetry
        int ixy = int(A.x);
        if (ixy >= 2) { float psi=abs(mod(atan(z.y,z.x)+PI/float(ixy),PI/(0.5*float(ixy)))-PI/float(ixy)); float len=length(z.xy); z=mix(z,vec3(cos(psi)*len,sin(psi)*len,z.z),A.y); }
        int iyz = int(A.z);
        if (iyz >= 2) { float psi=abs(mod(atan(z.z,z.y)+PI/float(iyz),PI/(0.5*float(iyz)))-PI/float(iyz)); float len=length(z.yz); z=mix(z,vec3(z.x,cos(psi)*len,sin(psi)*len),A.w); }
        int izx = int(B.x);
        if (izx >= 2) { float psi=abs(mod(atan(z.x,z.z)+PI/float(izx),PI/(0.5*float(izx)))-PI/float(izx)); float len=length(z.zx); z=mix(z,vec3(sin(psi)*len,z.y,cos(psi)*len),B.y); }
    } else if (tp == 4) {
        // Wobble: 3-plane sine wobble
        float ga = C.y;
        if (A.x != 0.0) z.z += ga*A.x*sin(A.y*length(z.xy)+A.z);
        if (A.w != 0.0) z.x += ga*A.w*sin(B.x*length(z.yz)+B.y);
        if (B.z != 0.0) z.y += ga*B.z*sin(B.w*length(z.zx)+C.x);
    } else if (tp == 5) {
        // Inversion: spherical inversion
        vec3 ctr = vec3(B.y, B.z, B.w);
        vec3 cp = z - ctr;
        float rSqrL = A.w / max(dot(cp,cp), 1e-6);
        vec3 inv = vec3(A.x+(z.x-ctr.x)*rSqrL, A.y+(z.y-ctr.y)*rSqrL, A.z+(z.z-ctr.z)*rSqrL);
        z = mix(z, inv, B.x);
    } else if (tp == 6) {
        // Helix: helical twist
        int axis = clamp(int(B.w), 0, 2); vec3 zz = z; float u; vec2 pp;
        if (axis==0){u=zz.z;pp=vec2(zz.x,zz.y);} else if(axis==1){u=zz.x;pp=vec2(zz.y,zz.z);} else{u=zz.y;pp=vec2(zz.z,zz.x);}
        float tw = A.y; float ca=cos(tw*u), ssa=sin(tw*u); pp = mat2(ca,-ssa,ssa,ca)*pp;
        float amp = B.y; if (abs(amp) > 0.001) { pp *= 1.0 + amp * sin(A.z*u + B.x); }
        float pd = A.w; if (pd > 0.01) { u = u - pd * floor((u + B.z) / pd + 0.5); }
        if(axis==0){zz = vec3(pp.x, pp.y, u);} else if(axis==1){zz = vec3(u, pp.x, pp.y);} else{zz = vec3(pp.y, u, pp.x);}
        z = mix(z, zz, clamp(A.x, 0.0, 1.0));
    } else if (tp == 7) {
        // SinCos: trigonometric modulation
        vec3 scc = z * B.w; vec3 sinZ=vec3(0),cosZ=vec3(0);
        if(A.x>0.5)sinZ.x=sin(scc.x); if(A.y>0.5)sinZ.y=sin(scc.y); if(A.z>0.5)sinZ.z=sin(scc.z);
        if(A.w>0.5)cosZ.x=cos(scc.x); if(B.x>0.5)cosZ.y=cos(scc.y); if(B.y>0.5)cosZ.z=cos(scc.z);
        int ct=int(B.z); vec3 rr;
        if(ct==1)rr=sinZ*cosZ; else if(ct==2)rr=z+sinZ+cosZ; else if(ct==3)rr=z+sinZ*cosZ; else if(ct==4)rr=z*(sinZ+cosZ); else if(ct==5)rr=z*sinZ*cosZ; else rr=sinZ+cosZ;
        z=mix(z,rr*C.x,clamp(C.y,0.0,1.0));
    } else if (tp == 8) {
        // Gnarl: distortion with 5 modes
        float aa=A.x,ba=A.y,ga=A.z,gs=A.w;
        float sx=B.x,sy=B.y,sz=B.z;
        int gm=int(B.w); vec3 gg=z;
        if(gm==1){gg.x=z.x-sx*sin(z.y+sin(aa*(z.y+sin(ba*z.y))));gg.y=z.y-sy*sin(z.x+sin(aa*(z.x+sin(ba*z.x))));}
        else if(gm==2){float xx=z.x*z.x;gg.x=z.x+sx*sin(ga*(z.y-xx)+sin(aa*(z.y+ba*cos(z.y))));gg.y=z.y+sy*sin(ga*(z.y+xx)-aa*sin(xx+ba*cos(xx)));}
        else if(gm==3){float xx=z.x*z.x,yy=z.y*z.y;gg.y=xx+sy*sin(yy*sqrt(abs(z.y))-aa*sin(yy+sin(ba*yy)));gg.x=yy-sx*sin(xx*sqrt(abs(xx))+sin(aa*(xx+sin(ba*xx))));}
        else if(gm==4){gg.x=z.x-sx*sin(z.z+sin(aa*(z.z+sin(ba*z.z))));gg.y=z.y-sy*sin(z.x+sin(aa*(z.x+sin(ba*z.x))));gg.z=(z.z-sz*sin(z.y+sin(aa*(z.y+sin(ba*z.y)))))*gs;}
        z=mix(z,gg*gs,clamp(C.x,0.0,1.0));
    }
    return z;
}

vec3 DE_applyTransforms(vec3 z) {
    z = applySlotTransform(z, int(uSlot0Type), int(uSlot0Vi), uSlot0A, uSlot0B, uSlot0C, uSlot0D, uSlot0E, uSlot0F);
    z = applySlotTransform(z, int(uSlot1Type), int(uSlot1Vi), uSlot1A, uSlot1B, uSlot1C, uSlot1D, uSlot1E, uSlot1F);
    z = applySlotTransform(z, int(uSlot2Type), int(uSlot2Vi), uSlot2A, uSlot2B, uSlot2C, uSlot2D, uSlot2E, uSlot2F);
    z = applySlotTransform(z, int(uSlot3Type), int(uSlot3Vi), uSlot3A, uSlot3B, uSlot3C, uSlot3D, uSlot3E, uSlot3F);
    z = applySlotTransform(z, int(uSlot4Type), int(uSlot4Vi), uSlot4A, uSlot4B, uSlot4C, uSlot4D, uSlot4E, uSlot4F);
    z = applySlotTransform(z, int(uSlot5Type), int(uSlot5Vi), uSlot5A, uSlot5B, uSlot5C, uSlot5D, uSlot5E, uSlot5F);
    return z;
}

// === FOLD SLOT DISPATCHER - 12 fold types ===
// Each fold slot: type (int from uFoldNType), params in 2 vec4s (A=Fd0-3, B=Fd4-7)
void applySlotFold(inout vec3 z, inout float dr, int tp, int vi, vec4 A, vec4 B) {
    if (tp == 0) return;
    if (tp == 1) {
        // boxfold: FoldLimit xyz=A.xyz, FoldBlend=A.w
        vec3 folded = clamp(z, -A.xyz, A.xyz) * 2.0 - z;
        z = mix(z, folded, A.w);
    } else if (tp == 2) {
        // spherefold: MinRadius=A.x, FixedRadius=A.y
        float minR2 = A.x * A.x;
        float fixR2 = A.y * A.y;
        float r2 = dot(z, z);
        if (r2 < minR2) { float t = fixR2 / minR2; z *= t; dr *= t; }
        else if (r2 < fixR2) { float t = fixR2 / r2; z *= t; dr *= t; }
    } else if (tp == 3) {
        // mengerfold
        z = abs(z);
        if (z.x < z.y) z.xy = z.yx;
        if (z.x < z.z) z.xz = z.zx;
        if (z.y < z.z) z.yz = z.zy;
    } else if (tp == 4) {
        // mandalayfold: FoldOffset=A.xyz, MbScale=A.w, MinRad2=B.x, SphereRad=B.y
        float fixedR2 = B.y * B.y;
        float minR2 = clamp(B.x, 0.0001, fixedR2);
        vec3 fo = max(A.xyz, vec3(0.01));
        z = clamp(z, -fo, fo) * 2.0 - z;
        float r2 = dot(z, z);
        if (r2 < minR2) { float t = fixedR2 / minR2; z *= t; dr *= t; }
        else if (r2 < fixedR2) { float t = fixedR2 / r2; z *= t; dr *= t; }
        z *= A.w;
        dr = abs(A.w) * dr + 1.0;
    } else if (tp == 5) {
        // quadraticfold: QOffset=A.xyz, QScale=A.w
        float ql = length(z);
        z = z * z * A.w + A.xyz;
        dr *= 2.0 * ql * abs(A.w) + 1.0;
    } else if (tp == 6) {
        // sierpinskifold: SierpOffset=A.xyz, SierpScale=A.w
        if (z.x + z.y < 0.0) z.xy = -z.yx;
        if (z.x + z.z < 0.0) z.xz = -z.zx;
        if (z.y + z.z < 0.0) z.yz = -z.zy;
        z = z * A.w - A.xyz * (A.w - 1.0);
        dr *= abs(A.w);
    } else if (tp == 7) {
        // absfold: per-axis abs, toggle thresholds at 0.5
        if (A.x > 0.5) z.x = abs(z.x);
        if (A.y > 0.5) z.y = abs(z.y);
        if (A.z > 0.5) z.z = abs(z.z);
    } else if (tp == 8) {
        // rotationfold: RotAxis=A.xyz, RotAngle=A.w
        vec3 ax = normalize(A.xyz + vec3(1e-8));
        float s = sin(A.w), c = cos(A.w), oc = 1.0 - c;
        mat3 rm = mat3(oc*ax.x*ax.x+c,     oc*ax.x*ax.y-ax.z*s, oc*ax.z*ax.x+ax.y*s,
                       oc*ax.x*ax.y+ax.z*s, oc*ax.y*ax.y+c,      oc*ax.y*ax.z-ax.x*s,
                       oc*ax.z*ax.x-ax.y*s, oc*ax.y*ax.z+ax.x*s, oc*ax.z*ax.z+c);
        z = rm * z;
    } else if (tp == 9) {
        // scalefold: ScaleVec=A.xyz, ScaleOffset=(A.w, B.x, B.y)
        z = z * A.xyz + vec3(A.w, B.x, B.y);
        dr *= max(abs(A.x), max(abs(A.y), abs(A.z)));
    } else if (tp == 10) {
        // amazingsurffold: FoldValue=A.xyz, AsFoldBlend=A.w
        vec3 folded;
        folded.x = abs(z.x + A.x) - abs(z.x - A.x) - z.x;
        folded.y = abs(z.y + A.y) - abs(z.y - A.y) - z.y;
        folded.z = abs(z.z + A.z) - abs(z.z - A.z) - z.z;
        z = mix(z, folded, A.w);
    } else if (tp == 11) {
        // octahedralfold
        if (z.x + z.y < 0.0) z.xy = -z.yx;
        if (z.x + z.z < 0.0) z.xz = -z.zx;
        if (z.x - z.y < 0.0) z.xy = z.yx;
        if (z.x - z.z < 0.0) z.xz = z.zx;
    } else if (tp == 12) {
        // kleinianfold: KMin=A.xyz, KMax=(A.w,B.xy), KPower=B.z
        z = 2.0 * clamp(z, A.xyz, vec3(A.w, B.xy)) - z;
        float r2 = dot(z, z);
        float rp2 = r2 * (B.z - 0.772);
        float k1 = max(1.0 / max(rp2, 1e-12), 1.0);
        z *= k1;
        dr *= k1;
    }
}

void DE_applyFolds(inout vec3 z, inout float dr) {
    applySlotFold(z, dr, int(uFold0Type), int(uFold0Vi), uFold0A, uFold0B);
    applySlotFold(z, dr, int(uFold1Type), int(uFold1Vi), uFold1A, uFold1B);
    applySlotFold(z, dr, int(uFold2Type), int(uFold2Vi), uFold2A, uFold2B);
    applySlotFold(z, dr, int(uFold3Type), int(uFold3Vi), uFold3A, uFold3B);
    applySlotFold(z, dr, int(uFold4Type), int(uFold4Vi), uFold4A, uFold4B);
    applySlotFold(z, dr, int(uFold5Type), int(uFold5Vi), uFold5A, uFold5B);
}
`;
var FORMULA_UNIFORMS = String.raw`
// Formula uniforms shared by family variants (Mandelbulb / Menger / Mandelbox)
uniform float uPower;
uniform float uThetaShift;
uniform float uPhiShift;
uniform float uMengerScale;
uniform vec3  uMengerOffset;
uniform float uMBScale;
uniform float uMinRad2;
uniform float uABScale;
`;
var MAIN = String.raw`
// === TF_OPS_SECTION_BEGIN ===
// (no TF-port operators connected — uniforms + helper funcs go here when an
//  OpRef custompar is set, see the builder())
// === TF_OPS_SECTION_END ===

vec3 estimateNormal(vec3 p) {
    const float e = 0.001;
    return normalize(vec3(
        fractal_sdf(p+vec3(e,0,0)) - fractal_sdf(p-vec3(e,0,0)),
        fractal_sdf(p+vec3(0,e,0)) - fractal_sdf(p-vec3(0,e,0)),
        fractal_sdf(p+vec3(0,0,e)) - fractal_sdf(p-vec3(0,0,e))
    ));
}

// -- Subsurface scattering (RayTK subsurfaceContrib port: "Berry" by kuvkar,
//    shadertoy ldcGWH). March INSIDE the object from just under the hit
//    point along jittered light directions; the accumulated interior path
//    length toward the light gives the transmittance exp(-len*density)^exp.
float frSSSRand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
vec3 frSSS(vec3 p, vec3 n, vec3 rd, vec3 albedo){
    if (uSSSEnable < 0.5 || uSSSStrength <= 0.0) return vec3(0.0);
    float samples = clamp(uSSSSamples, 1.0, 6.0);
    float sqs = sqrt(samples);
    vec3 Ldir = normalize(uLightPos);
    vec3 startFrom = p - n * max(uSSSThickness, 1e-4);
    float len = 0.0;
    float s0 = -samples * 0.5;
    for (int si = 0; si < 6; si++){
        if (float(si) >= samples) break;
        float s = s0 + float(si);
        vec3 rp = startFrom;
        vec3 ld = Ldir;
        ld.x += mod(abs(s), sqs) * uSSSScatter * sign(s + 0.5);
        ld.y += (s / sqs) * uSSSScatter;
        ld.x += frSSSRand(rp.xy * s) * uSSSScatter;
        ld.y += frSSSRand(rp.yx * s) * uSSSScatter;
        ld.z += frSSSRand(rp.zx * s) * uSSSScatter;
        ld = normalize(ld);
        for (int i = 0; i < 24; i++){
            float dist = fractal_sdf(rp);
            if (dist != dist) break;
            if (dist >= 0.0) break;         // exited the object
            rp += abs(dist * 0.5) * ld;     // march inside toward the light
        }
        len += length(p - rp);
    }
    float t = len / samples;
    t = exp(-t * uSSSDensity);
    t = pow(t, max(uSSSExponent, 0.01));
    // View/light gating (Barre-Brisebois translucency; the exp term above is
    // Mandelbulber's through-object shadow attenuation). Without this the
    // transmission was added UNGATED — lit faces have ~zero thickness toward
    // the light, so the whole surface glowed like a flat emissive overlay.
    // Now the glow concentrates where the camera looks INTO light that
    // passed THROUGH the object, plus a soft wrapped rim on shadow sides.
    vec3 LtDir = normalize(Ldir + n * 0.3);
    float VdotL = pow(clamp(dot(rd, LtDir), 0.0, 1.0), 3.0);
    float backNL = clamp(dot(-n, Ldir) * 0.5 + 0.5, 0.0, 1.0);
    float gate = clamp(VdotL + 0.6 * backNL * backNL, 0.0, 1.0);
    return uSSSColor * albedo * t * gate * uSSSStrength;
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    int cap = clamp(uShadowSteps, 4, 64);
    for (int i = 0; i < 64; i++) {
        if (i >= cap) break;
        float d = fractal_sdf(ro + rd * t);
        if (d < 0.0001) return 0.0;
        res = min(res, k * d / t);
        t += max(d, 0.001);
        if (t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

float aoSample(vec3 p, vec3 n) {
    int samples = clamp(uAoSteps, 1, 8);
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= samples) break;
        float h = 0.01 + 0.12 * float(i) / float(max(samples - 1, 1));
        float d = fractal_sdf(p + n * h);
        occ += (h - max(d, 0.0)) * sca;
        sca *= 0.85;
    }
    return clamp(1.0 - 1.5 * occ, 0.0, 1.0);
}

float hashPT(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 cosHemisphere(vec3 n, float u1, float u2) {
    float r = sqrt(u1);
    float phi = 6.2831853 * u2;
    vec3 tang = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0)));
    vec3 bitan = cross(n, tang);
    return normalize(r * cos(phi) * tang + r * sin(phi) * bitan + sqrt(1.0 - u1) * n);
}

vec3 sampleGGX(vec3 n, vec3 v, float rough, float u1, float u2) {
    float a = max(rough * rough, 0.001);
    float phi = 6.2831853 * u1;
    float cosT = sqrt((1.0 - u2) / (1.0 + (a * a - 1.0) * u2));
    float sinT = sqrt(max(0.0, 1.0 - cosT * cosT));
    vec3 h = vec3(cos(phi) * sinT, sin(phi) * sinT, cosT);
    vec3 up = abs(n.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0);
    vec3 tang = normalize(cross(up, n));
    vec3 bitan = cross(n, tang);
    vec3 Hw = tang * h.x + bitan * h.y + n * h.z;
    return normalize(reflect(-v, Hw));
}

void ftRender_(vec2 fc_, out vec4 outCol_, out vec4 outDepth_, out vec4 outEmission_) {
    // Initialize MRT outputs (depth and emission default to zero)
    outDepth_    = vec4(0.0);
    outEmission_ = vec4(0.0, 0.0, 0.0, 1.0);
    // Defaults match Fractania: non-hit = far (depth01=1.0), no emission.
    // Updated inside the volume / surface branches when a hit occurs.
    vec3 mrtEmission = vec3(0.0);
    float mrtDepth   = 1.0;
    float mrtDepthLin = MAX_DIST;
    vec2 uv = (fc_ / iResolution.xy)*2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    // Mouse interaction: orbit camera with mouse drag.
    // uMouse.xy comes from a panelCHOP's \`u\`/\`v\` channels which are
    // ALREADY normalized 0..1 across the panel, so we must NOT divide
    // by iResolution again (doing so collapses the term to ~-0.5 and
    // double-counts rotation when a wired cameraCOMP also drives uCamPos
    // — the classic "fractal moves 2x fast / only 2 sides visible" bug).
    //
    // X (azimuth):  one full screen-width drag  = 2*PI = 360° horizontal.
    // Y (elevation): one full screen-height drag = PI  = 180° vertical,
    //               THEN HARD-CLAMPED to (-PI/2 + eps, +PI/2 - eps) so the
    //               camera never crosses the pole and flips upside down
    //               (which felt like "getting lost" in Y).
    vec2 mouseOff = vec2(0.0);
    if (uMouse.z > 0.0) {
        mouseOff = (uMouse.xy - 0.5) * vec2(6.28318530718, 3.14159265359);
        mouseOff.y = clamp(mouseOff.y, -1.55334303, 1.55334303); // ±(PI/2 - 0.0175)
    }

    float fovRad = radians(clamp(uFOV, 20.0, 120.0)*0.5);
    float camDist = CAM_DIST / max(uZoom, 0.01);

    vec3 ro, fwd, right, up;

    if (uCamUseXform > 0.5) {
        // ── 1:1 world-matrix camera (CameraViewport / any the host camera rig) ──
        // Basis + position pushed each frame from the camera's worldTransform
        // by cam_uniform_push. Mouse orbit is intentionally NOT applied here:
        // the camera rig owns ALL navigation (tumble/pan/dolly/roll/WASD),
        // exactly like a normal geometry scene.
        ro     = uCamXformP;
        right  = normalize(uCamXformR);
        up     = normalize(uCamXformU);
        fwd    = normalize(uCamXformF);
        fovRad = radians(clamp(uCamXformFov, 1.0, 179.0) * 0.5);
    } else if (uCamMode == 1) {
        if (uCamOrbit > 0) {
            // Orbit-around-object: the eye IS the camera's world position
            // (uCamPos = the cameraCOMP's tx/ty/tz, or the Campos controls) and
            // always looks at the fractal centre (origin). The old code reparam-
            // etrised uCamPos.x/y/z as azimuth/elevation/distance (uCamPos.x*36° …),
            // which DIVERGED from the cameraCOMP's real position as you orbited
            // (the "camera COMP and GLSL camera don't line up" bug). Mouse drag
            // adds an extra orbit of the eye about the centre.
            ro = uCamPos;
            if (uMouse.z > 0.0) {
                float ca = cos(mouseOff.x), sa = sin(mouseOff.x);
                ro = mat3(ca, 0.0, sa,  0.0, 1.0, 0.0,  -sa, 0.0, ca) * ro;   // yaw about Y
                vec3 ax = normalize(cross(ro, vec3(0.0, 1.0, 0.0)) + vec3(1e-6));
                float ce = cos(mouseOff.y), se = -sin(mouseOff.y);          // pitch (Rodrigues) — UP/DOWN INVERTED
                ro = ro*ce + cross(ax, ro)*se + ax*dot(ax, ro)*(1.0 - ce);
            }
            fwd = (length(ro) > 1e-5) ? normalize(-ro) : vec3(0.0, 0.0, -1.0);
        } else {
            ro = uCamPos;
            fwd = rotZ(radians(uCamRot.z)) * rotY(radians(uCamRot.y)) * rotX(radians(uCamRot.x)) * vec3(0.0, 0.0, -1.0);
        }
        vec3 upRef = (abs(fwd.y) > 0.999) ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
        right = normalize(cross(upRef, fwd));
        up    = cross(fwd, right);
    } else {
        // Default camera with mouse interaction
        float azimuth = mouseOff.x;
        float elevation = mouseOff.y;
        ro = vec3(sin(azimuth)*cos(elevation), sin(elevation), cos(azimuth)*cos(elevation)) * camDist;
        ro += uTranslate;
        fwd = normalize(-ro + uTranslate);
        vec3 upRef = (abs(fwd.y) > 0.999) ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
        right = normalize(cross(upRef, fwd));
        up    = cross(fwd, right);
    }

    vec3 rd;
    // ── Equirectangular Camera mode (TF-port EquirectProjection) ──
    // When \`UseEquirectangularCamera\` is 1 (i.e. an EquirectProjection
    // op is wired into the fractal's \`Equirectprojectionop\` ref),
    // generate a 360° lat/lon ray. \`UseEquirectangularCamera\` and
    // \`EquirectangularFOV\`/\`EquirectangularBlend\` are pre-wired as
    // uniforms on the fractal's glslMAT/glslTOP via \`_add_scalar\` in
    // the builder — declared regardless of whether the snippet is
    // spliced, so this branch always compiles.
    if (UseEquirectangularCamera > 0.5) {
        vec2 ndc = (fc_ / iResolution.xy) * 2.0 - 1.0;
        // Full sweep: -PI..+PI horizontal, -PI/2..+PI/2 vertical.
        float fovScale = clamp(EquirectangularFOV / 6.28318530718, 0.05, 1.0);
        float theta = ndc.x * 3.14159265 * fovScale;
        float phi   = ndc.y * 1.57079633 * fovScale;
        vec3 dirL = vec3(cos(phi)*sin(theta), sin(phi), -cos(phi)*cos(theta));
        // Re-use camera basis so equirect picks up uCamRot orientation.
        rd = normalize(dirL.x*right + dirL.y*up + dirL.z*fwd);
    } else {
        rd = normalize(uv.x*right + uv.y*up + (1.0/tan(fovRad))*fwd);
    }

    // Thin-lens Depth of Field (Camera operators: Dof toggle, Aperture, Focaldist)
    if (uDofEnabled != 0 && uAperture > 0.0001) {
        vec3 focalPoint = ro + rd * max(uFocalDist, 0.01);
        float r  = sqrt(hashPT(fc_ + iTime*0.013)) * uAperture;
        float th = hashPT(fc_.yx * 1.37 + iTime*0.027) * 6.28318530718;
        vec2 disk = vec2(cos(th), sin(th)) * r;
        ro += right * disk.x + up * disk.y;
        rd  = normalize(focalPoint - ro);
    }

    vec3 col = frBackground(rd);
    float alpha = 0.0;

    if (uRenderMode == 3) {
        // -- Volume trace with directional lighting --
        float accAlpha = 0.0;
        vec3 accCol = vec3(0.0);
        float vt = 0.0;
        float stepSize = max(uEpsilon * 4.0, 0.002);

        vec3 volLight = normalize(uLightPos);

        for (int vi = 0; vi < MAX_STEPS; vi++) {
            if (vi >= uMaxSteps) break;
            vec3 vp = ro + rd * vt;
            float vd = fractal_sdf(vp);
            if (vd != vd) break;
            float density = clamp(1.0 - vd / max(uSoftness, 0.001), 0.0, 1.0);
            if (density > 0.001) {
                float diffTrapVol = 0.0;
                vec3 emVol = orbit_trap_color(vp, diffTrapVol);
                vec3 diffVol;
                if (uUseDiffuseGradient == 1 && textureSize(uDiffuseTex, 0).x > 1) {
                    diffVol = texture(uDiffuseTex, gFractDiffuseUV).rgb;
                } else if (uUseDiffuseGradient == 1 && (uDiffColor1 != vec3(0.0) || uDiffColor2 != vec3(0.0))) {
                    diffVol = mix(uDiffColor1, uDiffColor2, diffTrapVol);
                } else {
                    diffVol = gradient(diffTrapVol, uGradientMode);
                    vec3 dHsvVol = rgb2hsv(diffVol);
                    dHsvVol.x = fract(dHsvVol.x + (uDiffuseHue - 0.5));
                    diffVol = hsv2rgb(dHsvVol);
                }

                // Gradient-based directional lighting
                vec3 vn = estimateNormal(vp);
                float vDiff = max(dot(vn, volLight), 0.0) * uDiffuseStr;
                float vDiff2 = max(dot(vn, -volLight), 0.0) * 0.2 * uDiffuseStr;

                // Shadow ray for denser samples
                float vShadow = 1.0;
                if (density > 0.15 && uShadowSoft > 0.01) {
                    vShadow = softShadow(vp + vn*0.02, volLight, 0.02, 3.0, max(uShadowSoft, 0.1));
                }

                // Specular highlight on dense surfaces
                float vSpec = 0.0;
                if (density > 0.4) {
                    float roughness = clamp(uRoughness, 0.04, 1.0);
                    vec3 vHalf = normalize(volLight - rd);
                    float vSpecPow = 2.0/max(roughness*roughness, 0.001) - 2.0;
                    vSpec = pow(max(dot(vn, vHalf), 0.0), max(0.001, vSpecPow)) * uSpecularStr * density;
                }

                if (uSSSEnable > 0.5){
                    float dl = fractal_sdf(vp + volLight * max(uSSSThickness, 1e-4) * 10.0);
                    float pen = exp(min(dl, 0.0) * uSSSDensity);
                    emVol += uSSSColor * diffVol * pen * uSSSStrength * 0.5;
                }
                vec3 sampleCol = diffVol * (0.15 + vDiff * vShadow + vDiff2)
                                + diffVol * frEnvReflect(vn) * 0.6
                                + vec3(vSpec * vShadow)
                                + emVol * uSelfIllumination * uPTEmMult;
                float sampleAlpha = density * stepSize * 20.0;
                accCol += sampleCol * sampleAlpha * (1.0 - accAlpha);
                accAlpha += sampleAlpha * (1.0 - accAlpha);
                if (accAlpha > 0.98) break;
            }
            vt += max(abs(vd) * 0.5, stepSize);
            if (vt > MAX_DIST) break;
        }
        col = accCol + frBackground(rd) * (1.0 - accAlpha);
        alpha = accAlpha;
        // MRT taps for volume mode (Fractania-style)
        mrtDepthLin = vt;
        mrtDepth    = clamp(vt / MAX_DIST, 0.0, 1.0);
        mrtEmission = accCol;  // accumulated emissive contribution
    } else {
    // -- Standard raymarching --
    // Distance-adaptive hit threshold (2026-07-07): a FIXED uEpsilon
    // under-samples at distance (the world footprint of a pixel grows
    // with t) so thin features slip between steps and the whole shape
    // dissolves into dots when the camera pulls away. The threshold now
    // grows to half a pixel's world size at distance t.
    float pixK = tan(fovRad) * 2.0 / max(iResolution.y, 1.0);
    float t = 0.0;
    float steps = 0.0;
    bool hit = false;
    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= uMaxSteps) break;
        vec3 p = ro + rd*t;
        float d = fractal_sdf(p);
        if (d != d) break;
        float epsT = max(uEpsilon, t * pixK * 0.5);
        if (d < epsT) { hit = true; break; }
        if (t > MAX_DIST) break;
        t += max(d, uEpsilon * 0.1);
        steps += 1.0;
    }

    if (hit) {
        alpha = 1.0;
        vec3 p = ro + rd*t;
        vec3 n = estimateNormal(p);

        // MRT depth tap (Fractania-style: linear + normalized)
        mrtDepthLin = t;
        mrtDepth    = clamp(t / MAX_DIST, 0.0, 1.0);

        float diffTrapVal = 0.0;
        vec3 emission = orbit_trap_color(p, diffTrapVal);
        emission *= uSelfIllumination;
        // MRT emission tap
        mrtEmission = emission;

        vec3 diffuseCol;
        if (uUseDiffuseGradient == 1 && textureSize(uDiffuseTex, 0).x > 1) {
            diffuseCol = texture(uDiffuseTex, gFractDiffuseUV).rgb;
        } else if (uUseDiffuseGradient == 1 && (uDiffColor1 != vec3(0.0) || uDiffColor2 != vec3(0.0))) {
            diffuseCol = mix(uDiffColor1, uDiffColor2, diffTrapVal);
        } else {
            diffuseCol = gradient(diffTrapVal, uGradientMode);
            vec3 dHsv = rgb2hsv(diffuseCol);
            dHsv.x = fract(dHsv.x + (uDiffuseHue - 0.5));
            diffuseCol = hsv2rgb(dHsv);
        }

        vec3 l1 = normalize(uLightPos);
        vec3 l2 = normalize(vec3(-l1.x, -0.3, -l1.z));

        // Per-pixel AO: march normal-aligned samples (uses uAoSteps)
        float aoFac = mix(1.0, aoSample(p, n), clamp(uAoStrength, 0.0, 3.0));

        if (uRenderMode == 1) {
            // Enhanced PBR
            float diff1 = max(dot(n, l1), 0.0) * uDiffuseStr;
            float diff2 = max(dot(n, l2), 0.0) * 0.35 * uDiffuseStr;
            float shadow = 1.0;
            if (uShadowSoft > 0.01)
                shadow = softShadow(p + n*0.01, l1, 0.01, 5.0, max(uShadowSoft, 0.1));
            float roughness = clamp(uRoughness, 0.04, 1.0);
            vec3 halfDir = normalize(l1 - rd);
            float specPow = 2.0/max(roughness*roughness, 0.001) - 2.0;
            float spec = pow(max(dot(n, halfDir), 0.0), max(0.001, specPow)) * (specPow + 8.0)/(8.0*PI) * uSpecularStr;
            float _metalF = clamp(max(uMetallic, uReflection), 0.0, 1.0);
            vec3 F0 = mix(vec3(0.04), diffuseCol, _metalF);
            float hdotv = max(dot(halfDir, -rd), 0.0);
            vec3 F = F0 + (1.0 - F0)*pow(1.0 - hdotv, 5.0);
            vec3 kS = F;
            vec3 kD = (vec3(1.0) - kS) * (1.0 - _metalF);
            col = (kD*diffuseCol*(0.10 + diff1*shadow + diff2) + kS*spec*shadow) * aoFac;
            col += (kD*diffuseCol*frEnvIrradiance(n) + kS*frEnvReflect(reflect(rd, n))) * aoFac;
            col += frSSS(p, n, rd, diffuseCol);
            col += emission;  // compose emission additively on top of diffuse (thin glowing line)
            // === TF_OPS_LIGHTING_HOOK_BEGIN ===
            // (no TF-port lighting ops connected — call sites injected here)
            // === TF_OPS_LIGHTING_HOOK_END ===
            // distance-darkening exp(-0.06*t*t) REMOVED (USER SPEC 2026-07-07):
            // lighting stays constant regardless of camera distance.
        } else {
            // Default direct lighting with Material controls
            float diff1 = max(dot(n, l1), 0.0) * uDiffuseStr;
            float diff2 = max(dot(n, l2), 0.0) * 0.35 * uDiffuseStr;
            float shadow = 1.0;
            if (uShadowSoft > 0.01)
                shadow = softShadow(p + n*0.01, l1, 0.01, 5.0, max(uShadowSoft, 0.1));
            float roughness = clamp(uRoughness, 0.04, 1.0);
            vec3 halfDir = normalize(l1 - rd);
            float specPow = 2.0/max(roughness*roughness, 0.001) - 2.0;
            float spec = pow(max(dot(n, halfDir), 0.0), max(0.001, specPow)) * (specPow + 8.0)/(8.0*PI) * uSpecularStr;
            float _metalF = clamp(max(uMetallic, uReflection), 0.0, 1.0);
            vec3 F0 = mix(vec3(0.04), diffuseCol, _metalF);
            float hdotv = max(dot(halfDir, -rd), 0.0);
            vec3 F = F0 + (1.0 - F0)*pow(1.0 - hdotv, 5.0);
            vec3 kS = F;
            vec3 kD = (vec3(1.0) - kS) * (1.0 - _metalF);
            col = (kD*diffuseCol*(0.12 + diff1*shadow + diff2) + kS*spec*shadow) * aoFac;
            col += (kD*diffuseCol*frEnvIrradiance(n) + kS*frEnvReflect(reflect(rd, n))) * aoFac;
            col += frSSS(p, n, rd, diffuseCol);
            col += emission;  // compose emission additively on top of diffuse (thin glowing line)
            // === TF_OPS_LIGHTING_HOOK_BEGIN ===
            // (no TF-port lighting ops connected — call sites injected here)
            // === TF_OPS_LIGHTING_HOOK_END ===
            // distance-darkening exp(-0.06*t*t) REMOVED (USER SPEC 2026-07-07):
            // lighting stays constant regardless of camera distance.
        }
    }
    } // end standard raymarching else

    // === TF_OPS_FINAL_HOOK_BEGIN ===
    // (no TF-port post-shading ops connected — call sites injected here)
    // === TF_OPS_FINAL_HOOK_END ===

    col = pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2));
    // HDRI background is opaque so it composites (otherwise a black uBgColor
    // with uBlackFill=0 would leave the env-lit background transparent).
    float bgOpaque = (length(uBgColor) > 0.01 || uBlackFill > 0.5
                      || (UseEnvLighting > 0.5 && UseSphericalBackground > 0.5
                          && frHasEnvMap() && EnvBgBlend > 0.001)) ? 1.0 : 0.0;
    outCol_ = outputSwizzle(vec4(col, max(alpha, bgOpaque)));
    // Fractania-style depth packing:
    //   R = normalized depth (0=near, 1=far)
    //   G = linear distance / MAX_DIST (same; spare channel)
    //   B = 1/linear distance (inverse depth, useful for fog/parallax)
    //   A = 1
    float invDepth = (mrtDepthLin > 1e-6) ? (1.0 / mrtDepthLin) : 0.0;
    outDepth_    = outputSwizzle(vec4(mrtDepth, mrtDepth, mrtDepth, 1.0));
    outEmission_ = outputSwizzle(vec4(mrtEmission, 1.0));
}


void main() {
    vec4 c; vec4 d; vec4 e;
    ftRender_(gl_FragCoord.xy, c, d, e);
    fragColor = c;
    fragDepth = d;
    fragEmission = e;
}
`;
var MAIN_PT = String.raw`
// === TF_OPS_SECTION_BEGIN ===
// (no TF-port operators connected — uniforms + helper funcs go here when an
//  OpRef custompar is set, see the builder())
// === TF_OPS_SECTION_END ===

vec3 estimateNormal(vec3 p) {
    const float e = 0.001;
    return normalize(vec3(
        fractal_sdf(p+vec3(e,0,0)) - fractal_sdf(p-vec3(e,0,0)),
        fractal_sdf(p+vec3(0,e,0)) - fractal_sdf(p-vec3(0,e,0)),
        fractal_sdf(p+vec3(0,0,e)) - fractal_sdf(p-vec3(0,0,e))
    ));
}

// -- Subsurface scattering (RayTK subsurfaceContrib port: "Berry" by kuvkar,
//    shadertoy ldcGWH). March INSIDE the object from just under the hit
//    point along jittered light directions; the accumulated interior path
//    length toward the light gives the transmittance exp(-len*density)^exp.
float frSSSRand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
vec3 frSSS(vec3 p, vec3 n, vec3 rd, vec3 albedo){
    if (uSSSEnable < 0.5 || uSSSStrength <= 0.0) return vec3(0.0);
    float samples = clamp(uSSSSamples, 1.0, 6.0);
    float sqs = sqrt(samples);
    vec3 Ldir = normalize(uLightPos);
    vec3 startFrom = p - n * max(uSSSThickness, 1e-4);
    float len = 0.0;
    float s0 = -samples * 0.5;
    for (int si = 0; si < 6; si++){
        if (float(si) >= samples) break;
        float s = s0 + float(si);
        vec3 rp = startFrom;
        vec3 ld = Ldir;
        ld.x += mod(abs(s), sqs) * uSSSScatter * sign(s + 0.5);
        ld.y += (s / sqs) * uSSSScatter;
        ld.x += frSSSRand(rp.xy * s) * uSSSScatter;
        ld.y += frSSSRand(rp.yx * s) * uSSSScatter;
        ld.z += frSSSRand(rp.zx * s) * uSSSScatter;
        ld = normalize(ld);
        for (int i = 0; i < 24; i++){
            float dist = fractal_sdf(rp);
            if (dist != dist) break;
            if (dist >= 0.0) break;         // exited the object
            rp += abs(dist * 0.5) * ld;     // march inside toward the light
        }
        len += length(p - rp);
    }
    float t = len / samples;
    t = exp(-t * uSSSDensity);
    t = pow(t, max(uSSSExponent, 0.01));
    // View/light gating (Barre-Brisebois translucency; the exp term above is
    // Mandelbulber's through-object shadow attenuation). Without this the
    // transmission was added UNGATED — lit faces have ~zero thickness toward
    // the light, so the whole surface glowed like a flat emissive overlay.
    // Now the glow concentrates where the camera looks INTO light that
    // passed THROUGH the object, plus a soft wrapped rim on shadow sides.
    vec3 LtDir = normalize(Ldir + n * 0.3);
    float VdotL = pow(clamp(dot(rd, LtDir), 0.0, 1.0), 3.0);
    float backNL = clamp(dot(-n, Ldir) * 0.5 + 0.5, 0.0, 1.0);
    float gate = clamp(VdotL + 0.6 * backNL * backNL, 0.0, 1.0);
    return uSSSColor * albedo * t * gate * uSSSStrength;
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    int cap = clamp(uShadowSteps, 4, 64);
    for (int i = 0; i < 64; i++) {
        if (i >= cap) break;
        float d = fractal_sdf(ro + rd * t);
        if (d < 0.0001) return 0.0;
        res = min(res, k * d / t);
        t += max(d, 0.001);
        if (t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

float aoSample(vec3 p, vec3 n) {
    int samples = clamp(uAoSteps, 1, 8);
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= samples) break;
        float h = 0.01 + 0.12 * float(i) / float(max(samples - 1, 1));
        float d = fractal_sdf(p + n * h);
        occ += (h - max(d, 0.0)) * sca;
        sca *= 0.85;
    }
    return clamp(1.0 - 1.5 * occ, 0.0, 1.0);
}

float hashPT(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 cosHemisphere(vec3 n, float u1, float u2) {
    float r = sqrt(u1);
    float phi = 6.2831853 * u2;
    vec3 tang = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0)));
    vec3 bitan = cross(n, tang);
    return normalize(r * cos(phi) * tang + r * sin(phi) * bitan + sqrt(1.0 - u1) * n);
}

vec3 sampleGGX(vec3 n, vec3 v, float rough, float u1, float u2) {
    float a = max(rough * rough, 0.001);
    float phi = 6.2831853 * u1;
    float cosT = sqrt((1.0 - u2) / (1.0 + (a * a - 1.0) * u2));
    float sinT = sqrt(max(0.0, 1.0 - cosT * cosT));
    vec3 h = vec3(cos(phi) * sinT, sin(phi) * sinT, cosT);
    vec3 up = abs(n.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0);
    vec3 tang = normalize(cross(up, n));
    vec3 bitan = cross(n, tang);
    vec3 Hw = tang * h.x + bitan * h.y + n * h.z;
    return normalize(reflect(-v, Hw));
}

void ftRender_(vec2 fc_, out vec4 outCol_, out vec4 outDepth_, out vec4 outEmission_) {
    // Initialize MRT outputs (depth and emission default to zero)
    outDepth_    = vec4(0.0);
    outEmission_ = vec4(0.0, 0.0, 0.0, 1.0);
    // Defaults match Fractania: non-hit = far (depth01=1.0), no emission.
    // Updated inside the volume / surface branches when a hit occurs.
    vec3 mrtEmission = vec3(0.0);
    float mrtDepth   = 1.0;
    float mrtDepthLin = MAX_DIST;
    vec2 uv = (fc_ / iResolution.xy)*2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    // Mouse interaction: orbit camera with mouse drag.
    // uMouse.xy comes from a panelCHOP's \`u\`/\`v\` channels which are
    // ALREADY normalized 0..1 across the panel, so we must NOT divide
    // by iResolution again (doing so collapses the term to ~-0.5 and
    // double-counts rotation when a wired cameraCOMP also drives uCamPos
    // — the classic "fractal moves 2x fast / only 2 sides visible" bug).
    //
    // X (azimuth):  one full screen-width drag  = 2*PI = 360° horizontal.
    // Y (elevation): one full screen-height drag = PI  = 180° vertical,
    //               THEN HARD-CLAMPED to (-PI/2 + eps, +PI/2 - eps) so the
    //               camera never crosses the pole and flips upside down
    //               (which felt like "getting lost" in Y).
    vec2 mouseOff = vec2(0.0);
    if (uMouse.z > 0.0) {
        mouseOff = (uMouse.xy - 0.5) * vec2(6.28318530718, 3.14159265359);
        mouseOff.y = clamp(mouseOff.y, -1.55334303, 1.55334303); // ±(PI/2 - 0.0175)
    }

    float fovRad = radians(clamp(uFOV, 20.0, 120.0)*0.5);
    float camDist = CAM_DIST / max(uZoom, 0.01);

    vec3 ro, fwd, right, up;

    if (uCamUseXform > 0.5) {
        // ── 1:1 world-matrix camera (CameraViewport / any the host camera rig) ──
        // Basis + position pushed each frame from the camera's worldTransform
        // by cam_uniform_push. Mouse orbit is intentionally NOT applied here:
        // the camera rig owns ALL navigation (tumble/pan/dolly/roll/WASD),
        // exactly like a normal geometry scene.
        ro     = uCamXformP;
        right  = normalize(uCamXformR);
        up     = normalize(uCamXformU);
        fwd    = normalize(uCamXformF);
        fovRad = radians(clamp(uCamXformFov, 1.0, 179.0) * 0.5);
    } else if (uCamMode == 1) {
        if (uCamOrbit > 0) {
            // Orbit-around-object: the eye IS the camera's world position
            // (uCamPos = the cameraCOMP's tx/ty/tz, or the Campos controls) and
            // always looks at the fractal centre (origin). The old code reparam-
            // etrised uCamPos.x/y/z as azimuth/elevation/distance (uCamPos.x*36° …),
            // which DIVERGED from the cameraCOMP's real position as you orbited
            // (the "camera COMP and GLSL camera don't line up" bug). Mouse drag
            // adds an extra orbit of the eye about the centre.
            ro = uCamPos;
            if (uMouse.z > 0.0) {
                float ca = cos(mouseOff.x), sa = sin(mouseOff.x);
                ro = mat3(ca, 0.0, sa,  0.0, 1.0, 0.0,  -sa, 0.0, ca) * ro;   // yaw about Y
                vec3 ax = normalize(cross(ro, vec3(0.0, 1.0, 0.0)) + vec3(1e-6));
                float ce = cos(mouseOff.y), se = -sin(mouseOff.y);          // pitch (Rodrigues) — UP/DOWN INVERTED
                ro = ro*ce + cross(ax, ro)*se + ax*dot(ax, ro)*(1.0 - ce);
            }
            fwd = (length(ro) > 1e-5) ? normalize(-ro) : vec3(0.0, 0.0, -1.0);
        } else {
            ro = uCamPos;
            fwd = rotZ(radians(uCamRot.z)) * rotY(radians(uCamRot.y)) * rotX(radians(uCamRot.x)) * vec3(0.0, 0.0, -1.0);
        }
        vec3 upRef = (abs(fwd.y) > 0.999) ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
        right = normalize(cross(upRef, fwd));
        up    = cross(fwd, right);
    } else {
        // Default camera with mouse interaction
        float azimuth = mouseOff.x;
        float elevation = mouseOff.y;
        ro = vec3(sin(azimuth)*cos(elevation), sin(elevation), cos(azimuth)*cos(elevation)) * camDist;
        ro += uTranslate;
        fwd = normalize(-ro + uTranslate);
        vec3 upRef = (abs(fwd.y) > 0.999) ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
        right = normalize(cross(upRef, fwd));
        up    = cross(fwd, right);
    }

    vec3 rd;
    // ── Equirectangular Camera mode (TF-port EquirectProjection) ──
    // When \`UseEquirectangularCamera\` is 1 (i.e. an EquirectProjection
    // op is wired into the fractal's \`Equirectprojectionop\` ref),
    // generate a 360° lat/lon ray. \`UseEquirectangularCamera\` and
    // \`EquirectangularFOV\`/\`EquirectangularBlend\` are pre-wired as
    // uniforms on the fractal's glslMAT/glslTOP via \`_add_scalar\` in
    // the builder — declared regardless of whether the snippet is
    // spliced, so this branch always compiles.
    if (UseEquirectangularCamera > 0.5) {
        vec2 ndc = (fc_ / iResolution.xy) * 2.0 - 1.0;
        // Full sweep: -PI..+PI horizontal, -PI/2..+PI/2 vertical.
        float fovScale = clamp(EquirectangularFOV / 6.28318530718, 0.05, 1.0);
        float theta = ndc.x * 3.14159265 * fovScale;
        float phi   = ndc.y * 1.57079633 * fovScale;
        vec3 dirL = vec3(cos(phi)*sin(theta), sin(phi), -cos(phi)*cos(theta));
        // Re-use camera basis so equirect picks up uCamRot orientation.
        rd = normalize(dirL.x*right + dirL.y*up + dirL.z*fwd);
    } else {
        rd = normalize(uv.x*right + uv.y*up + (1.0/tan(fovRad))*fwd);
    }

    // Thin-lens Depth of Field (Camera operators: Dof toggle, Aperture, Focaldist)
    if (uDofEnabled != 0 && uAperture > 0.0001) {
        vec3 focalPoint = ro + rd * max(uFocalDist, 0.01);
        float r  = sqrt(hashPT(fc_ + iTime*0.013)) * uAperture;
        float th = hashPT(fc_.yx * 1.37 + iTime*0.027) * 6.28318530718;
        vec2 disk = vec2(cos(th), sin(th)) * r;
        ro += right * disk.x + up * disk.y;
        rd  = normalize(focalPoint - ro);
    }

    vec3 col = frBackground(rd);
    float alpha = 0.0;

    if (uRenderMode == 3) {
        // -- Volume trace with directional lighting --
        float accAlpha = 0.0;
        vec3 accCol = vec3(0.0);
        float vt = 0.0;
        float stepSize = max(uEpsilon * 4.0, 0.002);

        vec3 volLight = normalize(uLightPos);

        for (int vi = 0; vi < MAX_STEPS; vi++) {
            if (vi >= uMaxSteps) break;
            vec3 vp = ro + rd * vt;
            float vd = fractal_sdf(vp);
            if (vd != vd) break;
            float density = clamp(1.0 - vd / max(uSoftness, 0.001), 0.0, 1.0);
            if (density > 0.001) {
                float diffTrapVol = 0.0;
                vec3 emVol = orbit_trap_color(vp, diffTrapVol);
                vec3 diffVol;
                if (uUseDiffuseGradient == 1 && textureSize(uDiffuseTex, 0).x > 1) {
                    diffVol = texture(uDiffuseTex, gFractDiffuseUV).rgb;
                } else if (uUseDiffuseGradient == 1 && (uDiffColor1 != vec3(0.0) || uDiffColor2 != vec3(0.0))) {
                    diffVol = mix(uDiffColor1, uDiffColor2, diffTrapVol);
                } else {
                    diffVol = gradient(diffTrapVol, uGradientMode);
                    vec3 dHsvVol = rgb2hsv(diffVol);
                    dHsvVol.x = fract(dHsvVol.x + (uDiffuseHue - 0.5));
                    diffVol = hsv2rgb(dHsvVol);
                }

                // Gradient-based directional lighting
                vec3 vn = estimateNormal(vp);
                float vDiff = max(dot(vn, volLight), 0.0) * uDiffuseStr;
                float vDiff2 = max(dot(vn, -volLight), 0.0) * 0.2 * uDiffuseStr;

                // Shadow ray for denser samples
                float vShadow = 1.0;
                if (density > 0.15 && uShadowSoft > 0.01) {
                    vShadow = softShadow(vp + vn*0.02, volLight, 0.02, 3.0, max(uShadowSoft, 0.1));
                }

                // Specular highlight on dense surfaces
                float vSpec = 0.0;
                if (density > 0.4) {
                    float roughness = clamp(uRoughness, 0.04, 1.0);
                    vec3 vHalf = normalize(volLight - rd);
                    float vSpecPow = 2.0/max(roughness*roughness, 0.001) - 2.0;
                    vSpec = pow(max(dot(vn, vHalf), 0.0), max(0.001, vSpecPow)) * uSpecularStr * density;
                }

                if (uSSSEnable > 0.5){
                    float dl = fractal_sdf(vp + volLight * max(uSSSThickness, 1e-4) * 10.0);
                    float pen = exp(min(dl, 0.0) * uSSSDensity);
                    emVol += uSSSColor * diffVol * pen * uSSSStrength * 0.5;
                }
                vec3 sampleCol = diffVol * (0.15 + vDiff * vShadow + vDiff2)
                                + diffVol * frEnvReflect(vn) * 0.6
                                + vec3(vSpec * vShadow)
                                + emVol * uSelfIllumination * uPTEmMult;
                float sampleAlpha = density * stepSize * 20.0;
                accCol += sampleCol * sampleAlpha * (1.0 - accAlpha);
                accAlpha += sampleAlpha * (1.0 - accAlpha);
                if (accAlpha > 0.98) break;
            }
            vt += max(abs(vd) * 0.5, stepSize);
            if (vt > MAX_DIST) break;
        }
        col = accCol + frBackground(rd) * (1.0 - accAlpha);
        alpha = accAlpha;
        // MRT taps for volume mode (Fractania-style)
        mrtDepthLin = vt;
        mrtDepth    = clamp(vt / MAX_DIST, 0.0, 1.0);
        mrtEmission = accCol;  // accumulated emissive contribution
    } else {
    // -- Standard raymarching --
    // Distance-adaptive hit threshold (2026-07-07): a FIXED uEpsilon
    // under-samples at distance (the world footprint of a pixel grows
    // with t) so thin features slip between steps and the whole shape
    // dissolves into dots when the camera pulls away. The threshold now
    // grows to half a pixel's world size at distance t.
    float pixK = tan(fovRad) * 2.0 / max(iResolution.y, 1.0);
    float t = 0.0;
    float steps = 0.0;
    bool hit = false;
    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= uMaxSteps) break;
        vec3 p = ro + rd*t;
        float d = fractal_sdf(p);
        if (d != d) break;
        float epsT = max(uEpsilon, t * pixK * 0.5);
        if (d < epsT) { hit = true; break; }
        if (t > MAX_DIST) break;
        t += max(d, uEpsilon * 0.1);
        steps += 1.0;
    }

    if (hit) {
        alpha = 1.0;
        vec3 p = ro + rd*t;
        vec3 n = estimateNormal(p);

        // MRT depth tap (Fractania-style: linear + normalized)
        mrtDepthLin = t;
        mrtDepth    = clamp(t / MAX_DIST, 0.0, 1.0);

        float diffTrapVal = 0.0;
        vec3 emission = orbit_trap_color(p, diffTrapVal);
        emission *= uSelfIllumination;
        // MRT emission tap
        mrtEmission = emission;

        vec3 diffuseCol;
        if (uUseDiffuseGradient == 1 && textureSize(uDiffuseTex, 0).x > 1) {
            diffuseCol = texture(uDiffuseTex, gFractDiffuseUV).rgb;
        } else if (uUseDiffuseGradient == 1 && (uDiffColor1 != vec3(0.0) || uDiffColor2 != vec3(0.0))) {
            diffuseCol = mix(uDiffColor1, uDiffColor2, diffTrapVal);
        } else {
            diffuseCol = gradient(diffTrapVal, uGradientMode);
            vec3 dHsv = rgb2hsv(diffuseCol);
            dHsv.x = fract(dHsv.x + (uDiffuseHue - 0.5));
            diffuseCol = hsv2rgb(dHsv);
        }

        vec3 l1 = normalize(uLightPos);
        vec3 l2 = normalize(vec3(-l1.x, -0.3, -l1.z));

        // Per-pixel AO: march normal-aligned samples (uses uAoSteps)
        float aoFac = mix(1.0, aoSample(p, n), clamp(uAoStrength, 0.0, 3.0));

        if (uRenderMode == 1) {
            // Enhanced PBR
            float diff1 = max(dot(n, l1), 0.0) * uDiffuseStr;
            float diff2 = max(dot(n, l2), 0.0) * 0.35 * uDiffuseStr;
            float shadow = 1.0;
            if (uShadowSoft > 0.01)
                shadow = softShadow(p + n*0.01, l1, 0.01, 5.0, max(uShadowSoft, 0.1));
            float roughness = clamp(uRoughness, 0.04, 1.0);
            vec3 halfDir = normalize(l1 - rd);
            float specPow = 2.0/max(roughness*roughness, 0.001) - 2.0;
            float spec = pow(max(dot(n, halfDir), 0.0), max(0.001, specPow)) * (specPow + 8.0)/(8.0*PI) * uSpecularStr;
            float _metalF = clamp(max(uMetallic, uReflection), 0.0, 1.0);
            vec3 F0 = mix(vec3(0.04), diffuseCol, _metalF);
            float hdotv = max(dot(halfDir, -rd), 0.0);
            vec3 F = F0 + (1.0 - F0)*pow(1.0 - hdotv, 5.0);
            vec3 kS = F;
            vec3 kD = (vec3(1.0) - kS) * (1.0 - _metalF);
            col = (kD*diffuseCol*(0.10 + diff1*shadow + diff2) + kS*spec*shadow) * aoFac;
            col += (kD*diffuseCol*frEnvIrradiance(n) + kS*frEnvReflect(reflect(rd, n))) * aoFac;
            col += frSSS(p, n, rd, diffuseCol);
            col += emission;  // compose emission additively on top of diffuse (thin glowing line)
            // === TF_OPS_LIGHTING_HOOK_BEGIN ===
            // (no TF-port lighting ops connected — call sites injected here)
            // === TF_OPS_LIGHTING_HOOK_END ===
            // distance-darkening exp(-0.06*t*t) REMOVED (USER SPEC 2026-07-07):
            // lighting stays constant regardless of camera distance.
        } else {
            // Default direct lighting with Material controls
            float diff1 = max(dot(n, l1), 0.0) * uDiffuseStr;
            float diff2 = max(dot(n, l2), 0.0) * 0.35 * uDiffuseStr;
            float shadow = 1.0;
            if (uShadowSoft > 0.01)
                shadow = softShadow(p + n*0.01, l1, 0.01, 5.0, max(uShadowSoft, 0.1));
            float roughness = clamp(uRoughness, 0.04, 1.0);
            vec3 halfDir = normalize(l1 - rd);
            float specPow = 2.0/max(roughness*roughness, 0.001) - 2.0;
            float spec = pow(max(dot(n, halfDir), 0.0), max(0.001, specPow)) * (specPow + 8.0)/(8.0*PI) * uSpecularStr;
            float _metalF = clamp(max(uMetallic, uReflection), 0.0, 1.0);
            vec3 F0 = mix(vec3(0.04), diffuseCol, _metalF);
            float hdotv = max(dot(halfDir, -rd), 0.0);
            vec3 F = F0 + (1.0 - F0)*pow(1.0 - hdotv, 5.0);
            vec3 kS = F;
            vec3 kD = (vec3(1.0) - kS) * (1.0 - _metalF);
            col = (kD*diffuseCol*(0.12 + diff1*shadow + diff2) + kS*spec*shadow) * aoFac;
            col += (kD*diffuseCol*frEnvIrradiance(n) + kS*frEnvReflect(reflect(rd, n))) * aoFac;
            col += frSSS(p, n, rd, diffuseCol);
            col += emission;  // compose emission additively on top of diffuse (thin glowing line)
            // === TF_OPS_LIGHTING_HOOK_BEGIN ===
            // (no TF-port lighting ops connected — call sites injected here)
            // === TF_OPS_LIGHTING_HOOK_END ===
            // distance-darkening exp(-0.06*t*t) REMOVED (USER SPEC 2026-07-07):
            // lighting stays constant regardless of camera distance.
        }
    }
    } // end standard raymarching else

    // === TF_OPS_FINAL_HOOK_BEGIN ===
    // (no TF-port post-shading ops connected — call sites injected here)
    // === TF_OPS_FINAL_HOOK_END ===

    col = pow(clamp(col, 0.0, 1.0), vec3(1.0/2.2));
    // HDRI background is opaque so it composites (otherwise a black uBgColor
    // with uBlackFill=0 would leave the env-lit background transparent).
    float bgOpaque = (length(uBgColor) > 0.01 || uBlackFill > 0.5
                      || (UseEnvLighting > 0.5 && UseSphericalBackground > 0.5
                          && frHasEnvMap() && EnvBgBlend > 0.001)) ? 1.0 : 0.0;
    outCol_ = outputSwizzle(vec4(col, max(alpha, bgOpaque)));
    // Fractania-style depth packing:
    //   R = normalized depth (0=near, 1=far)
    //   G = linear distance / MAX_DIST (same; spare channel)
    //   B = 1/linear distance (inverse depth, useful for fog/parallax)
    //   A = 1
    float invDepth = (mrtDepthLin > 1e-6) ? (1.0 / mrtDepthLin) : 0.0;
    outDepth_    = outputSwizzle(vec4(mrtDepth, mrtDepth, mrtDepth, 1.0));
    outEmission_ = outputSwizzle(vec4(mrtEmission, 1.0));
}


void main() {
    vec4 c; vec4 d; vec4 e;
    ftRender_(gl_FragCoord.xy, c, d, e);
    fragColor = c;
    fragDepth = d;
    fragEmission = e;
}
`;
var VARIANTS = {
  Mandelbulb: String.raw`

uniform float uFamA;
uniform float uFamB;
uniform float uFamC;
uniform float uFamD;
uniform int   uFamI;
uniform float uFamRot;
uniform vec3  uFamOffset;

vec4 gOrbitDiffuse  = vec4(1e9);
vec4 gOrbitEmission = vec4(1e9);
bool gComputeOrbit  = false;
float fractal_sdf(vec3 pos) {
    vec3 z = pos / max(uZRadius, 0.01);
    z = RotatePosition(z, uPreRotation);
    z = DE_applyTransforms(z);
    int dMinI = int(uDiffMinIter), dMaxI = int(uDiffMaxIter);
    if (dMaxI <= dMinI) { dMinI = 0; dMaxI = int(uIterations); }
    int eMinI = int(uEmMinIter), eMaxI = int(uEmMaxIter);
    if (eMaxI <= eMinI) { eMinI = 0; eMaxI = int(uIterations); }
    if (gComputeOrbit) { gOrbitDiffuse = vec4(1e9); gOrbitEmission = vec4(1e9); }

    vec3 c = z;
    float dr = 1.0, r = 0.0;
    float P = clamp(uPower, 2.0, 16.0);
    for (int i = 0; i < MAX_ITERS; i++) {
        if (i >= uIterations) break;
        if (gComputeOrbit) {
            if (i >= dMinI && i < dMaxI) gOrbitDiffuse = min(gOrbitDiffuse, abs(vec4(z, 0.0)));
            if (i >= eMinI && i < eMaxI) gOrbitEmission = min(gOrbitEmission, abs(vec4(z, dot(z, z))));
        }

        z = RotatePosition(z, uRotateFractal);
        DE_applyFolds(z, dr);
        r = length(z); if (r > uBailout || r < 1e-6) break;
        float th = acos(clamp(z.z/r,-1.0,1.0)) + uThetaShift;
        float ph = atan(z.y, z.x) + uPhiShift;
        dr = pow(r, P-1.0)*P*dr + 1.0;
        float zr = pow(r, P);
        th *= P; ph *= P;
        z = c + zr*vec3(sin(th)*cos(ph), sin(th)*sin(ph), cos(th));
        z += uOffset; z *= uScale;
    }
    r = max(r,1e-6); return 0.5*log(r)*r/dr;

}

vec3 orbit_trap_color(vec3 pos, out float diffTrap) {
    gComputeOrbit = true;
    fractal_sdf(pos);
    gComputeOrbit = false;
    vec4 dTrap = gOrbitDiffuse, trap = gOrbitEmission;
    if (dTrap.x > 1e8) dTrap = vec4(0.5);
    if (trap.x > 1e8) trap = vec4(0.5);
    dTrap = sin(dTrap*uDiffusePeriod - uDiffuseOffset)*0.5 + 0.5;
    trap  = sin(trap*uEmissionPeriod - uEmissionOffset)*0.5 + 0.5;
        float du = dTrap.x, dv = dTrap.x;
    gFractDiffuseUV = clamp(vec2(du, dv), vec2(0.0), vec2(1.0));
    diffTrap = clamp(mix(du,dv,0.5), 0.0, 1.0);
        float eu = trap.x, ev = trap.x;
    gFractEmissionUV = clamp(vec2(eu, ev), vec2(0.0), vec2(1.0));
    float trapVal = clamp(mix(eu,ev,0.5), 0.0, 1.0);
    float glow = clamp(1.0 - trapVal/max(uEmissionThreshold, 1e-4), 0.0, 1.0);
    vec3 emCol;
    if (uUseEmissionGradient == 1 && textureSize(uEmissionTex, 0).x > 1) {
        emCol = texture(uEmissionTex, gFractEmissionUV).rgb;
    } else if (uUseEmissionGradient >= 1) {
        emCol = uEmColor;
    } else {
        emCol = vec3(0.0);
    }
    return emCol * glow * uSelfIllumination;
}
`,
  Menger: String.raw`

uniform float uFamA;
uniform float uFamB;
uniform float uFamC;
uniform float uFamD;
uniform int   uFamI;
uniform float uFamRot;
uniform vec3  uFamOffset;

vec4 gOrbitDiffuse  = vec4(1e9);
vec4 gOrbitEmission = vec4(1e9);
bool gComputeOrbit  = false;
float fractal_sdf(vec3 pos) {
    vec3 z = pos / max(uZRadius, 0.01);
    z = RotatePosition(z, uPreRotation);
    z = DE_applyTransforms(z);
    int dMinI = int(uDiffMinIter), dMaxI = int(uDiffMaxIter);
    if (dMaxI <= dMinI) { dMinI = 0; dMaxI = int(uIterations); }
    int eMinI = int(uEmMinIter), eMaxI = int(uEmMaxIter);
    if (eMaxI <= eMinI) { eMinI = 0; eMaxI = int(uIterations); }
    if (gComputeOrbit) { gOrbitDiffuse = vec4(1e9); gOrbitEmission = vec4(1e9); }

    float s = 1.0;
    float dr = 1.0;
    float ms = max(uMengerScale, 1.0);
    for (int i = 0; i < MAX_ITERS; i++) {
        if (i >= uIterations) break;
        if (gComputeOrbit) {
            if (i >= dMinI && i < dMaxI) gOrbitDiffuse = min(gOrbitDiffuse, abs(vec4(z, 0.0)));
            if (i >= eMinI && i < eMaxI) gOrbitEmission = min(gOrbitEmission, abs(vec4(z, dot(z, z))));
        }

        z = RotatePosition(z, uRotateFractal);
        DE_applyFolds(z, dr);
        z = abs(z);
        if (z.x - z.y < 0.0) z.xy = z.yx;
        if (z.x - z.z < 0.0) z.xz = z.zx;
        if (z.y - z.z < 0.0) z.yz = z.zy;
        z *= ms;
        z.x -= (ms - 1.0) * uMengerOffset.x;
        z.y -= (ms - 1.0) * uMengerOffset.y;
        if (z.z > 0.5*(ms - 1.0) * uMengerOffset.z) z.z -= (ms - 1.0) * uMengerOffset.z;
        z += uOffset; z *= uScale;
        s /= ms;
    }
    vec3 b = abs(z) - vec3(1.0);
    return s * (length(max(b, 0.0)) + min(max(b.x, max(b.y, b.z)), 0.0));

}

vec3 orbit_trap_color(vec3 pos, out float diffTrap) {
    gComputeOrbit = true;
    fractal_sdf(pos);
    gComputeOrbit = false;
    vec4 dTrap = gOrbitDiffuse, trap = gOrbitEmission;
    if (dTrap.x > 1e8) dTrap = vec4(0.5);
    if (trap.x > 1e8) trap = vec4(0.5);
    dTrap = sin(dTrap*uDiffusePeriod - uDiffuseOffset)*0.5 + 0.5;
    trap  = sin(trap*uEmissionPeriod - uEmissionOffset)*0.5 + 0.5;
        float du = dTrap.z, dv = dTrap.z;
    gFractDiffuseUV = clamp(vec2(du, dv), vec2(0.0), vec2(1.0));
    diffTrap = clamp(mix(du,dv,0.5), 0.0, 1.0);
        float eu = trap.x, ev = trap.x;
    gFractEmissionUV = clamp(vec2(eu, ev), vec2(0.0), vec2(1.0));
    float trapVal = clamp(mix(eu,ev,0.5), 0.0, 1.0);
    float glow = clamp(1.0 - trapVal/max(uEmissionThreshold, 1e-4), 0.0, 1.0);
    vec3 emCol;
    if (uUseEmissionGradient == 1 && textureSize(uEmissionTex, 0).x > 1) {
        emCol = texture(uEmissionTex, gFractEmissionUV).rgb;
    } else if (uUseEmissionGradient >= 1) {
        emCol = uEmColor;
    } else {
        emCol = vec3(0.0);
    }
    return emCol * glow * uSelfIllumination;
}
`
};
var VARIANT_NAMES = ["Mandelbulb", "Menger"];
var TRANSFORM_SNIPPETS = {
  2: String.raw`// LowRes: pixelation
float bl = A.x, sc2 = A.y;
z *= sc2; vec3 wi = round(z); vec3 wf = z - wi;
z = mix(z/sc2, (16.0*wf*wf*wf*wf*wf + wi)/sc2, bl);`,
  4: String.raw`// Wobble: 3-plane sine wobble
float ga = C.y;
if (A.x != 0.0) z.z += ga*A.x*sin(A.y*length(z.xy)+A.z);
if (A.w != 0.0) z.x += ga*A.w*sin(B.x*length(z.yz)+B.y);
if (B.z != 0.0) z.y += ga*B.z*sin(B.w*length(z.zx)+C.x);`
};
var FOLD_SNIPPETS = {
  1: String.raw`// boxfold: FoldLimit xyz=A.xyz, FoldBlend=A.w
vec3 folded = clamp(z, -A.xyz, A.xyz) * 2.0 - z;
z = mix(z, folded, A.w);`
};

// src/engine.mjs
function composeDispatcher(transformTypes, foldTypes) {
  let src = "\nvec3 applySlotTransform(vec3 z, int tp, int vi, vec4 A, vec4 B, vec4 C, vec4 D, vec4 E, vec4 F) {\n";
  for (const t of transformTypes) {
    if (TRANSFORM_SNIPPETS[t]) src += `  if (tp == ${t}) {
${TRANSFORM_SNIPPETS[t]}
  }
`;
  }
  src += "  return z;\n}\n";
  src += "vec3 DE_applyTransforms(vec3 z) {\n";
  for (let s = 0; s < 6; s++) {
    src += `  z = applySlotTransform(z, int(uSlot${s}Type), int(uSlot${s}Vi), uSlot${s}A, uSlot${s}B, uSlot${s}C, uSlot${s}D, uSlot${s}E, uSlot${s}F);
`;
  }
  src += "  return z;\n}\n";
  src += "void applySlotFold(inout vec3 z, inout float dr, int tp, int vi, vec4 A, vec4 B) {\n  if (tp == 0) return;\n";
  for (const t of foldTypes) {
    if (FOLD_SNIPPETS[t]) src += `  if (tp == ${t}) {
${FOLD_SNIPPETS[t]}
  }
`;
  }
  src += "}\n";
  src += "void DE_applyFolds(inout vec3 z, inout float dr) {\n";
  for (let s = 0; s < 6; s++) {
    src += `  applySlotFold(z, dr, int(uFold${s}Type), int(uFold${s}Vi), uFold${s}A, uFold${s}B);
`;
  }
  src += "}\n";
  return src;
}
var HEADER = `#version 300 es
precision highp float;
precision highp int;
#define outputSwizzle(v) (v)
uniform sampler2D uDiffuseTex;
uniform sampler2D uEmissionTex;
`;
var QUAD_VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
var COMPOSITE_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uPrev;
uniform float uFeedbackAmt;
in vec2 vUv;
out vec4 o;
void main() {
  vec4 s = texture(uScene, vUv);
  // decay floor guarantees trails fade fully to black instead of ghosting
  vec3 p = max(texture(uPrev, vUv).rgb * uFeedbackAmt - 0.004, 0.0);
  vec3 col = max(s.rgb, p);
  float a = max(s.a, min(1.0, (p.r + p.g + p.b) * 10.0));
  o = vec4(col, a);
}`;
var DISPLAY_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform float uChroma;
uniform vec2 uCover; // aspect-preserving cover-crop scale (1,1 = no-op)
in vec2 vUv;
out vec4 o;
void main() {
  vec2 cUv = 0.5 + (vUv - 0.5) * uCover;
  vec2 d = (cUv - 0.5) * uChroma;
  float r = texture(uTex, cUv + d).r;
  float g = texture(uTex, cUv).g;
  float b = texture(uTex, cUv - d).b;
  float a = texture(uTex, cUv).a;
  o = vec4(r, g, b, a);
}`;
var WEB_DEFAULTS = {
  uIterations: 12,
  uBailout: 16,
  uPower: 8,
  uThetaShift: 0,
  uPhiShift: 0,
  uOffset: [0, 0, 0],
  uScale: 1,
  uZRadius: 1,
  uTranslate: [0, 0, 0],
  uPreRotation: [0, 0, 0],
  uRotateFractal: [0, 0, 0],
  uFamOffset: [0.4, 0, 0],
  uFamA: 0,
  uFamB: 0,
  uFamC: 0,
  uFamD: 0,
  uFamI: 0,
  uFamRot: 0,
  uMengerScale: 3,
  uMengerOffset: [1, 1, 1],
  uMBScale: 2,
  uMinRad2: 0.25,
  uABScale: 1.5,
  uZoom: 1,
  uFOV: 45,
  uCamMode: 1,
  uCamPos: [1.6, 1, 3.5],
  uCamRot: [0, 0, 0],
  uCamOrbit: 1,
  uDofEnabled: 0,
  uAperture: 0.01,
  uFocalDist: 4,
  UseEquirectangularCamera: 0,
  EquirectangularFOV: 6.2831853,
  EquirectangularBlend: 1,
  uLightPos: [-5, 4, 3],
  uAoStrength: 1,
  uAoSteps: 4,
  uGradientMode: 2,
  uDiffuseHue: 0.5,
  uDiffOrbitMethod: 3,
  uEmOrbitMethod: 3,
  uDiffMinIter: 0,
  uDiffMaxIter: 0,
  uEmMinIter: 0,
  uEmMaxIter: 0,
  uBgColor: [0, 0, 0],
  uBlackFill: 0,
  uDiffusePeriod: 3,
  uDiffuseOffset: 0,
  uEmissionHue: 0.5,
  uEmissionPeriod: 3,
  uEmissionOffset: 0,
  uEmissionThreshold: 0.25,
  uSelfIllumination: 1,
  uDiffColor1: [1, 1, 1],
  uDiffColor2: [0.2, 0.2, 0.2],
  uEmColor: [1, 0.5, 0.1],
  uUseDiffuseGradient: 0,
  uUseEmissionGradient: 0,
  uEpsilon: 5e-4,
  uMaxSteps: 256,
  uMaxDist: 100,
  uRenderMode: 0,
  uShadowSoft: 16,
  uShadowSteps: 32,
  uDiffuseStr: 1,
  uSpecularStr: 0.3,
  uReflection: 0,
  uMetallic: 0,
  uRoughness: 0.5,
  uPTBounces: 2,
  uPTGIStr: 0.5,
  uPTEmMult: 1,
  uTaaSamples: 1,
  uSoftness: 0.02,
  uCompEnabled: 0,
  uCompScale: 1,
  uCompTranslate: [0, 0],
  uCompRotate: 0,
  uCompAlpha: 1,
  uMouse: [0, 0, 0, 0],
  uSlot0Type: 0,
  uSlot1Type: 0,
  uSlot2Type: 0,
  uSlot3Type: 0,
  uSlot4Type: 0,
  uSlot5Type: 0,
  uFold0Type: 0,
  uFold1Type: 0,
  uFold2Type: 0,
  uFold3Type: 0,
  uFold4Type: 0,
  uFold5Type: 0
};
function resolveValue(v, t) {
  try {
    if (typeof v === "function") return resolveValue(v(t), t);
    if (v && typeof v.queryArc === "function") {
      let qt = t;
      try {
        if (typeof globalThis.getTime === "function") {
          const st = globalThis.getTime();
          if (typeof st === "number" && Number.isFinite(st)) qt = st;
        }
      } catch (e) {
      }
      const haps = v.queryArc(qt, qt);
      const val = haps && haps.length ? haps[haps.length - 1].value : void 0;
      return resolveValue(val, t);
    }
    return v;
  } catch (e) {
    return void 0;
  }
}
function variantIndex(v) {
  if (typeof v === "number") return Math.max(0, Math.min(VARIANT_NAMES.length - 1, v | 0));
  if (typeof v !== "string") return 0;
  let s = v.trim().toLowerCase();
  const colon = s.lastIndexOf(":");
  if (colon >= 0) s = s.slice(colon + 1);
  else if (s === "mandelbulb" || s === "fractal" || s === "") return 0;
  const n = Number(s);
  if (!Number.isNaN(n)) return Math.max(0, Math.min(VARIANT_NAMES.length - 1, n | 0));
  const idx = VARIANT_NAMES.findIndex((name) => name.toLowerCase() === s);
  if (idx >= 0) return idx;
  const aliases = { bulb: 0, abs: 1, atan2: 2, julia: 3, kali: 4, pow2: 5, sincos: 6, quat: 7 };
  return aliases[s] ?? 0;
}
var FractaniaRenderer = class {
  constructor(config = {}) {
    const { canvas, pixelRatio = 0.75, fps = 0 } = config;
    if (!canvas) throw new Error("[fractania] FractaniaRenderer needs a { canvas }");
    this.canvas = canvas;
    this.pixelRatio = pixelRatio;
    this.fps = fps;
    this._lastRender = 0;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    });
    if (!gl) {
      throw new Error("[fractania] could not get a WebGL2 context \u2014 if this canvas already holds a different context type (e.g. hydra's WebGL1), pass a fresh canvas or let initFractania() create one");
    }
    this.gl = gl;
    this.spec = null;
    this.programs = {};
    this._passes = {
      composite: this._buildPass(COMPOSITE_FRAG),
      display: this._buildPass(DISPLAY_FRAG)
    };
    this._fbos = null;
    this._dummyTex = this._makeTex(1, 1, new Uint8Array([255, 255, 255, 255]));
    this._t0 = performance.now();
    this._speed = 1;
    this._orbit = { az: 0, el: 0, dragging: false, lastX: 0, lastY: 0 };
    this._installMouse();
    this._raf = 0;
    this._running = true;
    this._errStreak = 0;
    const loop = () => {
      if (!this._running) return;
      const now = performance.now();
      if (!this.fps || now - this._lastRender >= 1e3 / this.fps) {
        this._lastRender = now;
        try {
          this._frame();
          this._errStreak = 0;
        } catch (e) {
          if (this._errStreak === 0) console.error("[fractania] frame error (loop continues):", e);
          if (++this._errStreak > 300) {
            console.error("[fractania] 300 consecutive frame errors \u2014 stopping");
            this._running = false;
          }
        }
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  // ── public ──
  setSpec(spec) {
    this.spec = spec;
    if (spec && spec.staticVariant != null) {
      const mode = typeof spec.params.uRenderMode === "number" ? spec.params.uRenderMode : 0;
      this._ensureProgram(spec.staticVariant, this._slotKey(spec), mode === 2);
    }
  }
  // "t3.f1" = transform types 3 + fold types 1 in use; '' = stubs (fast path)
  _slotKey(spec) {
    if (!spec) return "";
    const tt = [...new Set((spec.transforms || []).map((x) => x.type))].sort((a, b) => a - b);
    const ft = [...new Set((spec.folds || []).map((x) => x.type))].sort((a, b) => a - b);
    if (!tt.length && !ft.length) return "";
    return `t${tt.join(".")}_f${ft.join(".")}`;
  }
  hush() {
    this.spec = null;
  }
  // Render one frame and read it back from the feedback FBO (which retains
  // its contents, unlike the default framebuffer). Used for testing.
  probe() {
    this._frame();
    const gl = this.gl;
    const f = this._fbos;
    if (!f) return null;
    const latest = f[f.prev];
    gl.bindFramebuffer(gl.FRAMEBUFFER, latest.fbo);
    const { w, h } = f;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    let nz = 0, sum = 0;
    for (let i = 0; i < px.length; i += 4) {
      const l = px[i] + px[i + 1] + px[i + 2];
      sum += l;
      if (l > 10) nz++;
    }
    const ci = ((h >> 1) * w + (w >> 1)) * 4;
    return {
      w,
      h,
      nonzero: nz,
      total: w * h,
      avg: sum / (w * h),
      center: [px[ci], px[ci + 1], px[ci + 2], px[ci + 3]],
      pixels: px
    };
  }
  destroy() {
    this._running = false;
    cancelAnimationFrame(this._raf);
    this._removeMouse?.();
  }
  // ── shader plumbing ──
  _compile(type, src) {
    const gl = this.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      const numbered = src.split("\n").map((l, i) => `${i + 1}: ${l}`).join("\n");
      console.error("[fractania] shader compile failed:\n" + log + "\n" + numbered.slice(0, 4e3));
      throw new Error("[fractania] shader compile failed: " + log.split("\n")[0]);
    }
    return sh;
  }
  _link(fragSrc) {
    const gl = this.gl;
    const prog = gl.createProgram();
    gl.attachShader(prog, this._compile(gl.VERTEX_SHADER, QUAD_VERT));
    gl.attachShader(prog, this._compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error("[fractania] program link failed: " + gl.getProgramInfoLog(prog));
    }
    const uniforms = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(prog, i);
      const name = info.name.replace(/\[0\]$/, "");
      uniforms[name] = { loc: gl.getUniformLocation(prog, info.name), type: info.type };
    }
    return { prog, uniforms };
  }
  _buildPass(fragSrc) {
    return this._link(fragSrc);
  }
  // Tiered builds: the default build glues in the no-op transform/fold stubs
  // and compiles fast everywhere; chains that use slot commands get a
  // dispatcher composed with ONLY their types.
  _ensureProgram(idx, slotKey = "", pt = false) {
    const key = `${idx}:${slotKey || "lite"}:${pt ? "pt" : "std"}`;
    if (!this.programs[key]) {
      const name = VARIANT_NAMES[idx];
      let dispatcher = STUBS;
      if (slotKey) {
        const spec = this.spec;
        const tt = [...new Set((spec?.transforms || []).map((x) => x.type))];
        const ft = [...new Set((spec?.folds || []).map((x) => x.type))];
        dispatcher = composeDispatcher(tt, ft);
      }
      const src = HEADER + PREAMBLE + dispatcher + FORMULA_UNIFORMS + VARIANTS[name] + (pt ? MAIN_PT : MAIN);
      const t0 = performance.now();
      this.programs[key] = this._link(src);
      const dt = performance.now() - t0;
      if (dt > 500) console.log(`[fractania] compiled ${name} (${key}) in ${(dt / 1e3).toFixed(1)}s`);
    }
    return this.programs[key];
  }
  _makeTex(w, h, data = null) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }
  _ensureFbos(w, h) {
    const gl = this.gl;
    if (this._fbos && this._fbos.w === w && this._fbos.h === h) return this._fbos;
    if (this._fbos) {
      for (const k of ["scene", "a", "b"]) {
        gl.deleteTexture(this._fbos[k].tex);
        gl.deleteFramebuffer(this._fbos[k].fbo);
      }
    }
    const make = () => {
      const tex = this._makeTex(w, h);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fbo };
    };
    this._fbos = { w, h, scene: make(), a: make(), b: make(), prev: "a", curr: "b" };
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this._fbos;
  }
  // ── uniform application ──
  _apply(pass, vals) {
    const gl = this.gl;
    for (const name in pass.uniforms) {
      const u = pass.uniforms[name];
      if (u.type === gl.SAMPLER_2D) continue;
      let v = vals[name];
      if (v === void 0) continue;
      switch (u.type) {
        case gl.FLOAT:
          gl.uniform1f(u.loc, Number(v) || 0);
          break;
        case gl.INT:
        case gl.BOOL:
          gl.uniform1i(u.loc, Number(v) | 0);
          break;
        case gl.FLOAT_VEC2:
          gl.uniform2f(u.loc, Number(v[0]) || 0, Number(v[1]) || 0);
          break;
        case gl.FLOAT_VEC3:
          gl.uniform3f(u.loc, Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0);
          break;
        case gl.FLOAT_VEC4:
          gl.uniform4f(u.loc, Number(v[0]) || 0, Number(v[1]) || 0, Number(v[2]) || 0, Number(v[3]) || 0);
          break;
        default:
          break;
      }
    }
  }
  // ── mouse orbit (Alt+drag anywhere; canvas has pointer-events:none) ──
  _installMouse() {
    const down = (e) => {
      if (!e.altKey) return;
      this._orbit.dragging = true;
      this._orbit.lastX = e.clientX;
      this._orbit.lastY = e.clientY;
      e.preventDefault();
    };
    const move = (e) => {
      if (!this._orbit.dragging) return;
      const dx = (e.clientX - this._orbit.lastX) / window.innerWidth;
      const dy = (e.clientY - this._orbit.lastY) / window.innerHeight;
      this._orbit.az += dx * Math.PI * 2;
      this._orbit.el = Math.max(-1.55, Math.min(1.55, this._orbit.el + dy * Math.PI));
      this._orbit.lastX = e.clientX;
      this._orbit.lastY = e.clientY;
    };
    const up = () => {
      this._orbit.dragging = false;
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    this._removeMouse = () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }
  // ── per-frame ──
  _frame() {
    const gl = this.gl;
    const canvas = this.canvas;
    const spec = this.spec;
    const t = spec ? (performance.now() - this._t0) / 1e3 * (resolveValue(spec.speed, 0) ?? 1) : 0;
    let cw, ch;
    if (spec && spec.resolution) {
      cw = Math.max(8, Math.min(4096, Math.round(resolveValue(spec.resolution[0], t) || 1280)));
      ch = Math.max(8, Math.min(4096, Math.round(resolveValue(spec.resolution[1], t) || 720)));
    } else {
      cw = Math.max(8, Math.round((canvas.clientWidth || window.innerWidth) * this.pixelRatio));
      ch = Math.max(8, Math.round((canvas.clientHeight || window.innerHeight) * this.pixelRatio));
    }
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    if (!spec) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    const vals = { ...WEB_DEFAULTS };
    vals.iTime = t;
    vals.iResolution = [cw, ch];
    for (const name in spec.params) {
      const raw = spec.params[name];
      if (Array.isArray(raw)) {
        const def = vals[name];
        vals[name] = raw.map((c, i) => {
          const rv = resolveValue(c, t);
          return rv === void 0 ? Array.isArray(def) ? def[i] : 0 : rv;
        });
      } else {
        const rv = resolveValue(raw, t);
        if (rv !== void 0) vals[name] = rv;
      }
    }
    const vIdx = variantIndex(resolveValue(spec.variant, t));
    const pass = this._ensureProgram(vIdx, this._slotKey(spec), (vals.uRenderMode | 0) === 2);
    const slotLetters = ["A", "B", "C", "D", "E", "F"];
    (spec.transforms || []).slice(0, 6).forEach((tr, i) => {
      vals[`uSlot${i}Type`] = tr.type;
      (tr.vecs || []).forEach((vec, j) => {
        vals[`uSlot${i}${slotLetters[j]}`] = vec.map((c) => resolveValue(c, t));
      });
    });
    (spec.folds || []).slice(0, 6).forEach((fd, i) => {
      vals[`uFold${i}Type`] = fd.type;
      (fd.vecs || []).forEach((vec, j) => {
        vals[`uFold${i}${slotLetters[j]}`] = vec.map((c) => resolveValue(c, t));
      });
    });
    const orbitSpeed = resolveValue(spec.orbitSpeed, t) || 0;
    const az = this._orbit.az + orbitSpeed * t;
    const el = this._orbit.el;
    if (az !== 0 || el !== 0) {
      const p = vals.uCamPos;
      const r = Math.max(1e-4, Math.hypot(p[0], p[1], p[2]));
      const az0 = Math.atan2(p[0], p[2]);
      const el0 = Math.asin(Math.max(-1, Math.min(1, p[1] / r)));
      const a = az0 + az;
      const e = Math.max(-1.55, Math.min(1.55, el0 + el));
      vals.uCamPos = [r * Math.sin(a) * Math.cos(e), r * Math.sin(e), r * Math.cos(a) * Math.cos(e)];
    }
    const fbos = this._ensureFbos(cw, ch);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos.scene.fbo);
    gl.viewport(0, 0, cw, ch);
    gl.disable(gl.BLEND);
    gl.useProgram(pass.prog);
    this._apply(pass, vals);
    if (pass.uniforms.uDiffuseTex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._paletteTex || this._dummyTex);
      gl.uniform1i(pass.uniforms.uDiffuseTex.loc, 0);
    }
    if (pass.uniforms.uEmissionTex) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this._emissionTex || this._dummyTex);
      gl.uniform1i(pass.uniforms.uEmissionTex.loc, 1);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const prev = fbos[fbos.prev];
    const curr = fbos[fbos.curr];
    const comp = this._passes.composite;
    gl.bindFramebuffer(gl.FRAMEBUFFER, curr.fbo);
    gl.useProgram(comp.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbos.scene.tex);
    gl.uniform1i(comp.uniforms.uScene.loc, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prev.tex);
    gl.uniform1i(comp.uniforms.uPrev.loc, 1);
    gl.uniform1f(
      comp.uniforms.uFeedbackAmt.loc,
      Math.max(0, Math.min(0.99, resolveValue(spec.feedback, t) || 0))
    );
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const disp = this._passes.display;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(disp.prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, curr.tex);
    gl.uniform1i(disp.uniforms.uTex.loc, 0);
    gl.uniform1f(disp.uniforms.uChroma.loc, resolveValue(spec.chromatic, t) || 0);
    const dispA = (canvas.clientWidth || window.innerWidth) / Math.max(1, canvas.clientHeight || window.innerHeight);
    const bufA = cw / ch;
    let sx = 1, sy = 1;
    if (dispA > bufA) sy = bufA / dispA;
    else sx = dispA / bufA;
    gl.uniform2f(disp.uniforms.uCover.loc, sx, sy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const tmp = fbos.prev;
    fbos.prev = fbos.curr;
    fbos.curr = tmp;
  }
};

// src/api.mjs
var RENDER_MODES = { basic: 0, direct: 0, pbr: 1 };
var FractalChain = class {
  constructor(engine2, variant = 0) {
    this._engine = engine2;
    this._spec = {
      variant,
      staticVariant: typeof variant === "number" ? variant : null,
      params: { uRenderMode: 1 },
      // lite defaults to PBR
      transforms: [],
      folds: [],
      feedback: 0,
      chromatic: 0,
      orbitSpeed: 0,
      speed: 1
    };
  }
  _p(name, value) {
    this._spec.params[name] = value;
    return this;
  }
  _v(name, comps) {
    this._spec.params[name] = comps;
    return this;
  }
  _tr(type, ...vecs) {
    if (this._spec.transforms.length >= 6) {
      console.warn("[fractania] max 6 transforms");
      return this;
    }
    this._spec.transforms.push({ type, vecs });
    return this;
  }
  _fd(type, ...vecs) {
    if (this._spec.folds.length >= 6) {
      console.warn("[fractania] max 6 folds");
      return this;
    }
    this._spec.folds.push({ type, vecs });
    return this;
  }
  // ── fractal core ──
  power(v) {
    return this._p("uPower", v);
  }
  iterations(v) {
    return this._p("uIterations", v);
  }
  bailout(v) {
    return this._p("uBailout", v);
  }
  thetashift(v) {
    return this._p("uThetaShift", v);
  }
  phishift(v) {
    return this._p("uPhiShift", v);
  }
  offset(x = 0, y = 0, z = 0) {
    return this._v("uOffset", [x, y, z]);
  }
  scale(v) {
    return this._p("uScale", v);
  }
  zradius(v) {
    return this._p("uZRadius", v);
  }
  // Menger
  mengerscale(v) {
    return this._p("uMengerScale", v);
  }
  mengeroffset(x = 1, y = 1, z = 1) {
    return this._v("uMengerOffset", [x, y, z]);
  }
  rotate(x = 0, y = 0, z = 0) {
    return this._v("uRotateFractal", [x, y, z]);
  }
  prerotate(x = 0, y = 0, z = 0) {
    return this._v("uPreRotation", [x, y, z]);
  }
  translate(x = 0, y = 0, z = 0) {
    return this._v("uTranslate", [x, y, z]);
  }
  // ── camera ──
  camera(x = 1.6, y = 1, z = 3.5) {
    this._p("uCamMode", 1);
    this._p("uCamOrbit", 1);
    return this._v("uCamPos", [x, y, z]);
  }
  camrot(x = 0, y = 0, z = 0) {
    this._p("uCamMode", 1);
    this._p("uCamOrbit", 0);
    return this._v("uCamRot", [x, y, z]);
  }
  fov(v) {
    return this._p("uFOV", v);
  }
  zoom(v) {
    return this._p("uZoom", v);
  }
  orbit(speed = 0.2) {
    this._spec.orbitSpeed = speed;
    return this;
  }
  dof(aperture = 0.05, focal = 4) {
    this._p("uDofEnabled", 1);
    this._p("uAperture", aperture);
    return this._p("uFocalDist", focal);
  }
  // ── shading / material ──
  light(x = -5, y = 4, z = 3) {
    return this._v("uLightPos", [x, y, z]);
  }
  metallic(v) {
    return this._p("uMetallic", v);
  }
  roughness(v) {
    return this._p("uRoughness", v);
  }
  reflection(v) {
    return this._p("uReflection", v);
  }
  // ── color (z-based) ──
  color(r = 1, g = 1, b = 1, r2, g2, b2) {
    this._p("uUseDiffuseGradient", 1);
    this._v("uDiffColor1", [r, g, b]);
    if (r2 !== void 0) this._v("uDiffColor2", [r2, g2 ?? 0, b2 ?? 0]);
    return this;
  }
  hue(v) {
    return this._p("uDiffuseHue", v);
  }
  glow(strength = 1, threshold = 0.25) {
    this._p("uUseEmissionGradient", 2);
    this._p("uSelfIllumination", strength);
    return this._p("uEmissionThreshold", threshold);
  }
  glowcolor(r = 1, g = 0.5, b = 0.1) {
    this._p("uUseEmissionGradient", 2);
    return this._v("uEmColor", [r, g, b]);
  }
  background(r = 0, g = 0, b = 0) {
    return this._v("uBgColor", [r, g, b]);
  }
  // ── renderer / march quality ──
  render(mode = "pbr") {
    const m = typeof mode === "string" ? RENDER_MODES[mode.toLowerCase()] ?? 1 : mode;
    return this._p("uRenderMode", m);
  }
  resolution(w = 1280, h = 720) {
    this._spec.resolution = [w, h];
    return this;
  }
  epsilon(v) {
    return this._p("uEpsilon", v);
  }
  steps(v) {
    return this._p("uMaxSteps", v);
  }
  maxdist(v) {
    return this._p("uMaxDist", v);
  }
  // ── transform slots (max 6, applied in call order) ──
  lowres(scale = 8, blend = 1) {
    return this._tr(2, [blend, scale, 0, 0]);
  }
  wobble(amp = 0.2, freq = 3, phase = 0, gain = 1) {
    return this._tr(4, [amp, freq, phase, amp], [freq, phase, amp, freq], [phase, gain, 0, 0]);
  }
  // ── fold slots (max 6, applied per iteration) ──
  boxfold(limit = 1, blend = 1) {
    return this._fd(1, [limit, limit, limit, blend]);
  }
  // ── post (web-side) ──
  feedback(v = 0.9) {
    this._spec.feedback = v;
    return this;
  }
  chromatic(v = 0.01) {
    this._spec.chromatic = v;
    return this;
  }
  speed(v = 1) {
    this._spec.speed = v;
    return this;
  }
  // ── activate ──
  out() {
    this._engine.setSpec(this._spec);
    return this;
  }
};
function installPatternMap() {
  const P = globalThis.Pattern;
  if (P && P.prototype && !P.prototype.map) {
    P.prototype.map = function(inMin, inMax, outMin, outMax) {
      return this.fmap((v) => outMin + (v - inMin) / (inMax - inMin) * (outMax - outMin));
    };
  }
}

// src/index.mjs
var engine = null;
var latestOptions = null;
var CANVAS_ID = "fractania-canvas";
function ensureCanvas(pixelRatio, pixelated) {
  let canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = CANVAS_ID;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style = "pointer-events:none;width:100%;height:100%;position:fixed;top:0;left:0";
    if (pixelated) canvas.style.imageRendering = "pixelated";
    document.body.prepend(canvas);
  }
  return canvas;
}
function boot(canvas, options) {
  engine = new FractaniaRenderer({ canvas, ...options });
  globalThis.fractaniaRenderer = engine;
  installGlobals();
  return engine;
}
async function initFractania(options = {}) {
  if (latestOptions && JSON.stringify(latestOptions) !== JSON.stringify(options)) {
    clearFractania();
  }
  latestOptions = options;
  if (!engine) {
    const { pixelRatio = 0.75, pixelated = true, canvas: userCanvas, ...rest } = options;
    if (rest.detectAudio) console.warn("[fractania] detectAudio not implemented yet \u2014 drive params with strudel signals instead");
    if (rest.feedStrudel) console.warn("[fractania] feedStrudel not implemented yet");
    const canvas = userCanvas || ensureCanvas(pixelRatio, pixelated);
    boot(canvas, { pixelRatio, fps: rest.fps ?? 0 });
  }
  return engine;
}
function clearFractania() {
  if (engine) {
    engine.destroy();
    engine = null;
  }
  document.getElementById(CANVAS_ID)?.remove();
  latestOptions = null;
}
var F = (p) => () => {
  const t = typeof globalThis.getTime === "function" ? globalThis.getTime() : performance.now() / 1e3;
  const haps = p.queryArc(t, t);
  return haps && haps.length ? haps[haps.length - 1].value : void 0;
};
var PATTERN_CHARS = /[<>\s*[\]~{}!@|]/;
function fractal(variant = 0) {
  if (!engine) throw new Error("[fractania] call `await initFractania()` first");
  let v = variant;
  let staticIdx = null;
  if (typeof v === "number") staticIdx = variantIndex(v);
  else if (typeof v === "string") {
    if (PATTERN_CHARS.test(v.trim()) && typeof globalThis.mini === "function") {
      v = globalThis.mini(v);
    } else {
      staticIdx = variantIndex(v);
    }
  }
  const chain = new FractalChain(engine, v);
  chain._spec.staticVariant = staticIdx;
  return chain;
}
function installGlobals() {
  installPatternMap();
  globalThis.fractal = fractal;
  globalThis.fractania = fractal;
  globalThis.initFractania = initFractania;
  globalThis.clearFractania = clearFractania;
  if (!globalThis.F) globalThis.F = F;
}
var FractaniaAsHydra = class {
  constructor(config = {}) {
    const { canvas, ...rest } = config;
    if (engine) engine.destroy();
    let target = null;
    if (canvas) {
      const gl2 = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
      });
      if (gl2) target = canvas;
      else if (canvas.id === "hydra-canvas") canvas.style.display = "none";
    }
    const pr = rest.pixelRatio ?? rest.pixelratio ?? 0.75;
    boot(target || ensureCanvas(pr, true), { pixelRatio: pr, fps: rest.fps ?? 0 });
  }
  hush() {
    engine?.hush();
  }
};
if (typeof globalThis.Hydra === "undefined") globalThis.Hydra = FractaniaAsHydra;
globalThis.fractal = fractal;
globalThis.fractania = fractal;
globalThis.initFractania = initFractania;
globalThis.clearFractania = clearFractania;
if (!globalThis.F) globalThis.F = F;
if (!globalThis.__fractaniaLoaded) {
  globalThis.__fractaniaLoaded = true;
  await initFractania();
}
export {
  F,
  FractalChain,
  FractaniaAsHydra,
  FractaniaRenderer,
  VARIANT_NAMES,
  clearFractania,
  fractal,
  initFractania
};
