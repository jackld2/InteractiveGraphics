/**
 * @fileoverview Terrain - A simple 3D terrain using WebGL
 * @author Eric Shaffer
 */

/** Class implementing 3D terrain. */
class Terrain{   
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 */
    constructor(div,minX,maxX,minY,maxY){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;
        
        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        this.generateLines();
        console.log("Terrain: Generated lines");
        
        
        this.diamondSquare();
        
        for (var i =0; i < div+1; i++) {
            for (var j =0; j < div+1; j++) {
                console.log(this.getZ(i,j));
            }
        }
        
        this.generateNormals();
        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext ==null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }
    
    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1) + j);
        this.vBuffer[vid] = v[0];
        this.vBuffer[vid+1]=v[1];
        this.vBuffer[vid+2]=v[2];
    }
    
    //Sets the z of vertex i,j
    setZ(i,j,z)
    {
        //Your code here
        var vid = 3*(i*(this.div+1) + j);
        this.vBuffer[vid+2]=z;
    }
    
    //Gets the z of vertex i,j
    getZ(i,j) {
        var vid = 3*(i*(this.div+1) + j);
        return this.vBuffer[vid+2];
        
    }
    
    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        //Your code here
        var vid = 3*(i*(this.div+1)+j);
        v[0]= this.vBuffer[vid];
        v[1]= this.vBuffer[vid+1];
        v[2]= this.vBuffer[vid+2];
    }
    
    /**
    * Send the buffer objects to WebGL for rendering 
    */
    loadBuffers()
    {
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
    
        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
    
        // Specify faces of the terrain 
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");
    
        //Setup Edges  
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;
        
        console.log("triangulatedPlane: loadBuffers");
    }
    
    /**
    * Render the triangles 
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }
    
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges(){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
    }
    
    getTriangleVertex(i, index) 
    {
        
        var v = vec3.fromValues(
        this.vBuffer[this.fBuffer[i+index]*3], 
        this.vBuffer[this.fBuffer[i+index]*3+1], 
        this.vBuffer[this.fBuffer[i+index]*3+2]);
        
        return v;
    
        
    }
    
    //Computes the normal vectors of each vertex
    generateNormals()
    {
        for(var i=0; i<this.fBuffer.length; i+=3)
        {
            
            //generate Three Triangle Vertices
            var v1 = this.getTriangleVertex(i,0);
            var v2 = this.getTriangleVertex(i,1);
            var v3 = this.getTriangleVertex(i,2);
            
            //Create two vectors using the 3 vertices
            var vect1 = vec3.create();
            var vect2 = vec3.create();
            vec3.sub(vect2,v2,v1);
            vec3.sub(vect1,v3,v1);
            
            var v = vec3.create();
            console.log("vec2: ", vect2[0],", ", vect2[1],", ",  vect2[2] );
            console.log("vec1: ", vect1[0],", ", vect1[1],", ",  vect1[2] );
            
            //Do cross product of the two vectors
            vec3.cross(v,vect2,vect1);
            
            console.log("Cross: ", v[0],", ", v[1],", ",  v[2] );
            
            //Normalize the vector
            vec3.normalize(v,v);
            
            //Add to the normals
            this.nBuffer[this.fBuffer[i]*3]+=v[0];
            this.nBuffer[this.fBuffer[i]*3+1]+=v[1];
            this.nBuffer[this.fBuffer[i]*3+2]+=v[2];
            
            this.nBuffer[this.fBuffer[i+1]*3]+=v[0];
            this.nBuffer[this.fBuffer[i+1]*3+1]+=v[1];
            this.nBuffer[this.fBuffer[i+1]*3+2]+=v[2];
            
            this.nBuffer[this.fBuffer[i+2]*3]+=v[0];
            this.nBuffer[this.fBuffer[i+2]*3+1]+=v[1];
            this.nBuffer[this.fBuffer[i+2]*3+2]+=v[2];
        }
        
    }
    

//Generates Triangles
generateTriangles()
{
    //Your code here
    var deltaX=(this.maxX-this.minX)/this.div;
    var deltaY=(this.maxY-this.minY)/this.div;
    
    for(var i=0;i<=this.div;i++)
        for(var j=0;j<=this.div;j++)
            {
                this.vBuffer.push(this.minX+deltaX*j);
                this.vBuffer.push(this.minY+deltaY*i);
                this.vBuffer.push(0);
                
                this.nBuffer.push(0);
                this.nBuffer.push(0);
                this.nBuffer.push(0);
            }
    for(var i=0;i<this.div;i++)
        for(var j=0;j<this.div;j++)
            {
                var vid = i*(this.div+1) + j;
                this.fBuffer.push(vid);
                this.fBuffer.push(vid+1);
                this.fBuffer.push(vid+this.div+1);
                
                this.fBuffer.push(vid+1);
                this.fBuffer.push(vid+1+this.div+1);
                this.fBuffer.push(vid+this.div+1);
            }
    
    
    //
    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;
}
    
//Performs Diamond Square algorithm and sets Z values accordingly 
diamondSquare() {
    
    this.setZ(0,0,0.1);
    this.setZ(0,this.div,0.1);
    this.setZ(this.div, 0, 0.1);
    this.setZ(this.div, this.div, 0.1);
    
    var radius = this.div;
    var lower_bound = -0.05;
    var upper_bound = 0.05;
    
    while (radius > 1) {
        var step = radius / 2;
        
        var dimI = [];
        var dimJ = [];
        
        for(var i=0; i < this.div; i += radius) {
            for(var j=0; j < this.div; j += radius) {
                
                var bl = this.getZ(i,j);
                var br = this.getZ(i+radius, j);
                var tl = this.getZ(i, j+radius);
                var tr = this.getZ(i+radius, j+radius);
                var average = (bl+br+tl+tr)/4;
                var roughness = Math.random()*(upper_bound - lower_bound) + lower_bound;
                var x = i+(radius/2);
                var y = j+(radius/2);
                
                //store vertices for square portion of algorithm
                //push top
                if ( (x >= 0 && x <= this.div) && ( y + step >=0 && y + step <= this.div) ) {
                    dimI.push(x);
                    dimJ.push(y + step);
                }
                
                //push right
                if ( (x+step >= 0 && x+step <= this.div) && ( y >=0 && y <= this.div) ) {
                    dimI.push(x + step);
                    dimJ.push(y);
                }
                //push left
                if ( (x - step >= 0 && x - step <= this.div) && ( y >=0 && y <= this.div) ) {
                    dimI.push(x - step);
                    dimJ.push(y);
                }
                //push bottom
                if ( (x >= 0 && x <= this.div) && ( y - step >=0 && y - step <= this.div) ) {
                    dimI.push(x);
                    dimJ.push(y - step);
                }
                
                this.setZ(i+(radius/2), j+(radius/2), average + roughness );
                console.log("Set Z", i+(radius/2) , ", ", j+(radius/2), ": ");
                console.log(5/2);
            }
        }
        
        for(var i =0; i < dimI.length; i++) {
            var neighbors = 0;
            var sum = 0;
            var x = dimI[i];
            var y = dimJ[i];
            
         //sums up square top left and bottom
            //push top
            if ( (x >= 0 && x <= this.div) && ( y + step >=0 && y + step <= this.div) ) {
                sum += this.getZ(x, y + step);
                neighbors++;
            }

            //push right
            if ( (x+step >= 0 && x+step <= this.div) && ( y >=0 && y <= this.div) ) {
                sum += this.getZ(x+step, y);
                neighbors++;
            }
            //push left
            if ( (x - step >= 0 && x - step <= this.div) && ( y >=0 && y <= this.div) ) {
                sum += this.getZ(x-step, y);
                neighbors++;
            }
            //push bottom
            if ( (x >= 0 && x <= this.div) && ( y - step >=0 && y - step <= this.div) ) {
                sum += this.getZ(x, y-step);
                neighbors++;
            }
            
            var roughness = Math.random()*(upper_bound - lower_bound) + lower_bound;
            var average = sum/neighbors;
            this.setZ(x,y, average + roughness)
            
            
            
            console.log("Added: ", dimI[i], ", ", dimJ[i], " has ", neighbors, " neighbors", ", Set Z to: ", average + roughness);
     
        }
        //Chnage the bounds and divide the radius
        radius = radius/2;
        lower_bound += 0.009;
        upper_bound -= 0.009;
    }
    
}
    
//generateDiamondSquareTriangles() {
//    
//}

/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ", 
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ", 
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");
                       
          }
        
    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);
        
        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);
        
        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]);
    }
    
}
    
}
