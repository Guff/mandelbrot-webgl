varying vec2 p;
const float maxIter = 250.0;
const float shades = 50.0;
const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
const vec4 c0 = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 c1 = vec4(0.0, 1.0, 0.0, 1.0);

bool inSet(vec2 point, out float iters) {
	vec2 z;
	for (float i = 0.0; i < maxIter; i++) {
		z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + point;
		
		if (length(z) > 2.0) {
			iters = i;
			return false;
		}
	}
	
	return true;
}

vec4 getColor(vec2 point) {
	float iters;
	
	if (inSet(point, iters)) {
		return black;
	} else {
		float r = mod(iters, shades);
		if (mod(iters, 2.0 * shades) >= shades)
			r = shades - r; 
		
		return mix(c0, c1, r / shades);
	}
}

void main() {
	gl_FragColor = getColor(p);
}
